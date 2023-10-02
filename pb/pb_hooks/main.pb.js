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

routerAdd("GET", "/api/payments/intent/:id", (c) => {
    try {
        const btoa = require(`${__hooks}/btoa.js`);
        const paymongoToken = $os.getenv("PAYMONGO_TOKEN");
        if (paymongoToken.length === 0) {
            throw new ApiError(500, "PAYMONGO must be set");
        }

        const paymentIntentId = c.pathParam("id");
        const clientKey = c.queryParam("client_key");
        if (clientKey.length === 0) {
            throw new BadRequestError("client_key query param is required");
        }

        const intentResp = $http.send({
            url: `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}?client_key=${clientKey}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': btoa(`Basic ${paymongoToken}`),
            },
        });

        return c.json(200, intentResp.data);
    } catch (e) {
        console.error(e);
        throw e;
    }
});

// NOTE: this should be opened in a window with postMessage
routerAdd("POST", "/api/payments/initiate", (c) => {
    try {
        const btoa = require(`${__hooks}/btoa.js`);
        const data = $apis.requestInfo(c).data;
        const host = "http://" + c.request().host;
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

        // 2. Create payment method
        const paymentMethodResp = $http.send({
            url: 'https://api.paymongo.com/v1/payment_methods',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(paymongoToken)}`,
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        type: paymentRecord.getString('payment_method'),
                        details: data.details,
                    }
                }
            }),
        });
        if (paymentMethodResp.json.errors) {
            console.error(paymentMethodResp.raw);
            throw new ApiError(500, "Something went wrong while processing your payments. [2]");
        }

        // 3. Attach payment method to payment intent
        const paymentMethodId = paymentMethodResp.json.data.id;
        const attachResp = $http.send({
            url: `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(paymongoToken)}`,
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        payment_method: paymentMethodId,
                        client_key: clientKey,
                        // TODO: add BASE_URL env
                        return_url: host + "/payments_redirect",
                    }
                }
            }),
        });
        if (attachResp.json.errors) {
            console.error(attachResp.raw);
            throw new ApiError(500, "Something went wrong while processing your payments. [3]");
        }

        // 4. Redirecting the customer for authentication
        // NOTE: It's up to the frontend for this
        const paymentIntent = attachResp.json.data;
        return c.json(200, paymentIntent);
    } catch(e) {
        console.error(e);
        throw e;
    }
});

routerAdd("GET", "/api/payment-methods", (c) => {
    return c.json(200, [
        {
            id: "card",
            label: "Credit Card",
            processorRate: 0.035,
            extraProcessorFee: 15
        },
        {
            id: "gcash",
            label: "GCash",
            processorRate: 0.025,
            extraProcessorFee: 0
        },
        {
            id: "paymaya",
            label: "Maya",
            processorRate: 0.02,
            extraProcessorFee: 0
        }
    ]);
});

routerAdd("GET", "/assets/*", $apis.staticDirectoryHandler(`${__hooks}/assets`, false));

onRecordBeforeCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const data = $apis.requestInfo(e.httpContext).data;

    try {
        // Validate
        utils.validateRelationalData('addon_orders', data.addons_data);
        utils.validateRelationalData('payments', data.payment_data);
        utils.validateRelationalData(profileCollectionKey, data[profileDataKey]);
        utils.validateRelationalData('merch_sensing_data', data.merch_sensing_data_data);
    } catch (e) {
        console.log(e);
        throw new BadRequestError("An error occurred while submitting the form.", e);
    }
}, "registrations");

onRecordAfterCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileKey, profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const reqInfo = $apis.requestInfo(e.httpContext);
    const data = reqInfo.data;

    try {
        const addonOrders = data.addons_data ? data.addons_data.map(a => {
            const addonOrder = utils.saveRelationalData('addon_orders',
                Object.assign({ registrant: e.record.id }, a));
            return addonOrder.id;
        }) : [];
        e.record.set('addons', addonOrders);

        const paymentRecord = utils.saveRelationalData('payments',
            Object.assign({
                registrant: e.record.id, status: 'pending'
            }, data.payment_data));
        e.record.set('payment', paymentRecord.id);

        const statusRecord = utils.saveRelationalData('registration_statuses', { registrant: e.record.id, status: 'pending' });
        e.record.set('status', statusRecord.id);

        const merchSensingDRecord = utils.saveRelationalData('merch_sensing_data', Object.assign({ registrant: e.record.id }, data.merch_sensing_data_data));
        e.record.set('merch_sensing_data', merchSensingDRecord);

        utils.decodeAndSaveProfile(e.record, undefined, profileKey, profileCollectionKey, data[profileDataKey]);
        $app.dao().saveRecord(e.record);

        if (!reqInfo.authRecord && !reqInfo.authRecord) {
            const host = "http://" + e.httpContext.request().host;
            // Send e-mail if it was not created from admin dashboard
            utils.sendEmails('summary', `id = "${e.record.id}"`, host);
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
}, "registrations");

onRecordBeforeUpdateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const data = $apis.requestInfo(e.httpContext).data;

    try {
        // Validate
        utils.validateRelationalData(profileCollectionKey, data[profileDataKey]);
        utils.validateRelationalData('merch_sensing_data', data.merch_sensing_data_data);
    } catch (e) {
        console.log(e);
        throw new BadRequestError("An error occurred while submitting the form.", e);
    }
}, "registrations");

onRecordAfterUpdateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const registrant = e.record.id;
    const { profileKey, profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const data = $apis.requestInfo(e.httpContext).data;

    try {
        if (data[profileDataKey] && Object.keys(data[profileDataKey]).length !== 0) {
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
            utils.decodeAndSaveProfile(registrant, oldProfileId, profileKey, profileCollectionKey, data[profileDataKey]);
        }

        const merchSensingDRecord = utils.saveRelationalData('merch_sensing_data', data.merch_sensing_data_data, e.record.getString('merch_sensing_data'));
        e.record.set('merch_sensing_data', merchSensingDRecord);

        $app.dao().saveRecord(e.record);
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
