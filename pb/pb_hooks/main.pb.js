/// <reference path="../pb_data/types.d.ts" />
onAfterBootstrap((e) => {
    const utils = require(`${__hooks}/utils.js`);
    utils.buildRegistrationFields();
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

routerAdd("GET", "/assets/*", $apis.staticDirectoryHandler(`${__hooks}/assets`, false));

onRecordBeforeCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const data = $apis.requestInfo(e.httpContext).data;

    try {
        // Validate
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
