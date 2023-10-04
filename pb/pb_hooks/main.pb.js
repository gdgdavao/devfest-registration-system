/// <reference path="../pb_data/types.d.ts" />

onAfterBootstrap((e) => {
    const utils = require(`${__hooks}/utils.js`);
    utils.buildRegistrationFields();

    if ($os.getenv("PAYMENT_INTENT_API_URL").length === 0) {
        console.error("Warning: PAYMENT_INTENT_API_URL must be set. Some endpoints might not work properly.");
    }

    if ($os.getenv("PAYMONGO_TOKEN").length === 0) {
        console.error("Warning: PAYMONGO_TOKEN must be set. Some endpoints might not work properly.");
    }
});

routerAdd("GET", "/api/registration_fields", (c) => {
    const utils = require(`${__hooks}/utils.js`);
    const registrationType = c.queryParamDefault("type", "student");
    const formGroup = c.queryParamDefault("group", "all");
    const fields = utils.getRegistrationFields(registrationType);
    return c.json(200, formGroup !== 'all' ? fields.filter(f => f.group === formGroup) : fields);
});

routerAdd("GET", "/api/slot_counter", (c) => {
    const TOTAL_SLOTS = 400;
    const studentsSlots = TOTAL_SLOTS * 0.75;
    const proSlots = TOTAL_SLOTS - studentsSlots;

    const allSlotsLeft = $app.dao().findRecordsByIds("slot_counter", ["student", "professional"]);
    const proSlotsRecord = allSlotsLeft[0];
    const studentSlotsRecord = allSlotsLeft[1]

    let studentSlotsRegistered = 0;
    let proSlotsRegistered = 0;

    if (studentSlotsRecord) {
        studentSlotsRegistered = studentSlotsRecord.getInt("slots_registered");
    }

    if (proSlotsRecord) {
        proSlotsRegistered = proSlotsRecord.getInt("slots_registered");
    }

    return c.json(200, [
        {
            "slot_name": "Student",
            "total": studentsSlots,
            "registered": studentSlotsRegistered
        },
        {
            "slot_name": "Professional",
            "total": proSlots,
            "registered": proSlotsRegistered
        }
    ]);
});

routerAdd("POST", "/api/admin/send_emails", (c) => {
    try {
        const params = new DynamicModel({
            filter: "",
            type: "confirm", // confirm or summary
            force: false
        });

        c.bind(params);

        if (params.type !== "confirm" && params.type !== "summary") {
            throw new BadRequestError("Type should be either `confirm` or `summary`.");
        } else if (params.filter.length === 0 && !params.force) {
            // to avoid accidental deliveries of email to all recipients unless force is true
            throw new BadRequestError("Filter should not be empty.");
        }

        const utils = require(`${__hooks}/utils.js`);
        const host = "http://" + c.request().host;
        const numEmailsSent = utils.sendEmails(params.type, params.filter, host);
        return c.json(200, {"message": `Successfully sent to ${numEmailsSent} e-mails.`});
    } catch (e) {
        console.error(e);
        throw e;
    }
}, $apis.requireAdminAuth());

routerAdd("GET", "/payments_redirect", (c) => {
    try {
        const utils = require(`${__hooks}/utils.js`);
        const paymentIntentId = c.queryParam("payment_intent_id");
        if (paymentIntentId.length === 0) {
            console.log("Empty payment intent id");
            throw new BadRequestError();
        }

        const paymentRecords = $app.dao().findRecordsByFilter('payments', `status != "paid" && payment_intent_id = "${paymentIntentId}"`);
        if (paymentRecords.length === 0) {
            throw new BadRequestError("Invalid transaction.");
        }

        const paymentRecord = paymentRecords[0];
        paymentRecord.set('status', 'paid');
        $app.dao().saveRecord(paymentRecord);

        // NOTE: Send summary e-mail here lol
        const host = "http://" + c.request().host;
        // Send e-mail if it was not created from admin dashboard
        utils.sendEmails('summary', `id = "${paymentRecord.getString('registrant')}"`, host);
        return c.html(200, "OK");
    } catch (e) {
        console.error(e);
    }
});

// NOTE: this should be opened in a window with postMessage
routerAdd("POST", "/api/payments/initiate", (c) => {
    try {
        const btoa = require(`${__hooks}/btoa.js`);
        const data = $apis.requestInfo(c).data;
        const registrantId = data.registrant_id;

        // create a payment data first upon registration so that things
        // such as "exp amount" won't be tampered easily
        const paymentId = data.payment_id;
        if (!registrantId || !paymentId) {
            throw new BadRequestError("Registrant ID and payment ID are required.");
        }

        const paymentIntentUrl = $os.getenv("PAYMENT_INTENT_API_URL");
        const paymongoToken = $os.getenv("PAYMONGO_TOKEN");

        if (paymentIntentUrl.length === 0) {
            throw new ApiError(500, "PAYMENT_INTENT_API_URL must be set");
        } else if (paymongoToken.length === 0) {
            throw new ApiError(500, "PAYMONGO must be set");
        }

        const record = $app.dao().findRecordById("registrations", registrantId);
        const paymentRecord = $app.dao().findRecordById("payments", paymentId);
        const apiKey = btoa(paymongoToken);

        // 1. Create payment intent
        const resp = $http.send({
            url: `${paymentIntentUrl}/payment`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: registrantId,
                email: record.email(),
                cost: paymentRecord.getInt('expected_amount') * 100
            })
        });

        if (!resp.json.success) {
            console.error(resp.raw);
            throw new ApiError(500, "Something went wrong while processing your payments. [1]");
        }

        /** @type {string} */
        const clientKey = resp.json.data.client_key;
        const paymentIntentId = clientKey.split('_client')[0];
        paymentRecord.set('payment_intent_id', paymentIntentId);
        $app.dao().saveRecord(paymentRecord);

        // 2. Create payment method
        // 3. Attach payment method to payment intent
        // 4. Redirecting the customer for authentication
        // NOTE: It's up to the frontend for this
        // const paymentIntent = attachResp.json.data;
        return c.json(200, {
            api_key: apiKey,
            client_key: clientKey,
            payment_intent_id: paymentIntentId,
            endpoints: {
                create_payment_method: 'https://api.paymongo.com/v1/payment_methods',
                attach_payment_intent: `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
                payment_intent: `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`
            }
        });
    } catch(e) {
        console.error(e);
        throw e;
    }
});

routerAdd("GET", "/api/payment-methods", (c) => {
    return c.json(200, [
        // {
        //     id: "card",
        //     label: "Credit Card",
        //     processorRate: 0.035,
        //     extraProcessorFee: 15
        // },
        {
            id: "gcash",
            label: "GCash",
            processorRate: 0.0,
            extraProcessorFee: 0
        },
        // {
        //     id: "paymaya",
        //     label: "Maya",
        //     processorRate: 0.02,
        //     extraProcessorFee: 0
        // }
    ]);
});

routerAdd("GET", "/assets/*", $apis.staticDirectoryHandler(`${__hooks}/assets`, false));

onRecordBeforeCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const profile_data = JSON.parse(e.httpContext.formValueDefault(profileDataKey, "null"));
    const addons_data = JSON.parse(e.httpContext.formValueDefault("addons_data", "[]"));
    const payment_data = JSON.parse(e.httpContext.formValueDefault("payment_data", "null"));
    const merch_sensing_data_data = JSON.parse(e.httpContext.formValueDefault("merch_sensing_data_data", "null"));

    try {
        // Validate
        utils.validateRelationalData('addon_orders', addons_data);
        utils.validateRelationalData('manual_payments', payment_data);
        utils.validateRelationalData(profileCollectionKey, profile_data);
        utils.validateRelationalData('merch_sensing_data', merch_sensing_data_data);
    } catch (e) {
        console.log(e);
        throw new BadRequestError("An error occurred while submitting the form.", e);
    }
}, "registrations");

onRecordAfterCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileKey, profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));

    try {
        const profile_data = JSON.parse(e.httpContext.formValueDefault(profileDataKey, "null"))
        const addons_data = JSON.parse(e.httpContext.formValueDefault("addons_data", "[]"));
        // const payment_data = JSON.parse(e.httpContext.formValueDefault("payment_data", "null"));
        const merch_sensing_data_data = JSON.parse(e.httpContext.formValueDefault("merch_sensing_data_data", "null"));

        const addonOrders = addons_data ? addons_data.map(a => {
            const addonOrder = utils.saveRelationalData('addon_orders',
                Object.assign({ registrant: e.record.id }, a));
            return addonOrder.id;
        }) : [];
        e.record.set('addons', addonOrders);

        /** @type {models.Record} */
        // const paymentRecord = utils.saveRelationalData('manual_payments',
        //     Object.assign({
        //         registrant: e.record.id,
        //         status: 'paid',
        //     }, payment_data));

        // const form = new RecordUpsertForm($app, paymentRecord);
        // form.addFiles("receipt", e.httpContext.formFile("payment_data.receipt"));
        // form.submit();

        // e.record.set('payment', paymentRecord.id);

        const statusRecord = utils.saveRelationalData('registration_statuses', { registrant: e.record.id, status: 'pending' });
        e.record.set('status', statusRecord.id);

        const merchSensingDRecord = utils.saveRelationalData('merch_sensing_data', Object.assign({ registrant: e.record.id }, merch_sensing_data_data));
        e.record.set('merch_sensing_data', merchSensingDRecord.id);

        utils.decodeAndSaveProfile(e.record, undefined, profileKey, profileCollectionKey, profile_data);
        $app.dao().saveRecord(e.record);
    } catch (e) {
        console.error(e);
        throw e;
    }
}, "registrations");

onRecordBeforeUpdateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const profile_data = JSON.parse(e.httpContext.formValueDefault(profileDataKey, "null"));
    const merch_sensing_data_data = JSON.parse(e.httpContext.formValueDefault("merch_sensing_data_data", "null"));

    try {
        // Validate
        utils.validateRelationalData(profileCollectionKey, profile_data);
        utils.validateRelationalData('merch_sensing_data', merch_sensing_data_data);
    } catch (e) {
        console.log(e);
        throw new BadRequestError("An error occurred while submitting the form.", e);
    }
}, "registrations");

onRecordAfterUpdateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const registrant = e.record.id;
    const { profileKey, profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const profile_data = JSON.parse(e.httpContext.formValueDefault(profileDataKey, "null"));
    const merch_sensing_data_data = JSON.parse(e.httpContext.formValueDefault("merch_sensing_data_data", "null"));

    try {
        if (profile_data && Object.keys(profile_data).length !== 0) {
            let oldProfileId = null;

            // Get opposite keys
            let { profileKey: oppositeProfileKey, profileCollectionKey: oppositeProfileCKey } =
                utils.getProfileKeys(e.record.getString('type') === 'student' ? 'professional' : 'student');

            // If a user mistakenly selects $type but is a $oppositeType, delete existing record of it
            const oppositeProfileId = e.record.getString(oppositeProfileKey);
            if (oppositeProfileId.length !== 0) {
                e.record.set(oppositeProfileKey, null);
                $app.dao().saveRecord(e.record);

                const oldProfile = $app.dao().findRecordById(oppositeProfileCKey, oppositeProfileId);
                $app.dao().deleteRecord(oldProfile);
            } else {
                oldProfileId = e.record.getString(profileKey);

                // If oldProfile is still empty, make it null again
                if (oldProfileId && oldProfileId.length === 0) {
                    oldProfileId = null;
                }
            }

            // Create and save to record
            utils.decodeAndSaveProfile(registrant, oldProfileId, profileKey, profileCollectionKey, profile_data);
        }

        const merchSensingDRecord = utils.saveRelationalData('merch_sensing_data', merch_sensing_data_data, e.record.getString('merch_sensing_data'));
        e.record.set('merch_sensing_data', merchSensingDRecord);

        $app.dao().saveRecord(e.record);

        if (e.record.getString(profileKey).length != 0 && e.record.getString('payment').length != 0) {
            const host = "http://" + e.httpContext.request().host;
            // Send e-mail if it was not created from admin dashboard
            utils.sendEmails('summary', `id = "${e.record.id}"`, host);
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
}, "registrations");

onCollectionAfterUpdateRequest((e) => {
    if (e.collection.name === "registrations") {
        const utils = require(`${__hooks}/utils.js`);
        utils.buildRegistrationFields();
    }
});

onRecordAfterCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    utils.buildRegistrationFields();
}, "form_details");

onRecordAfterUpdateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    utils.buildRegistrationFields();
}, "form_details");

onRecordAfterDeleteRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    utils.buildRegistrationFields();
}, "form_details");
