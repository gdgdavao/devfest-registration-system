/// <reference path="../pb_data/types.d.ts" />
onAfterBootstrap((e) => {
    const utils = require(`${__hooks}/utils.js`);
    utils.buildRegistrationFields();
});

routerAdd("GET", "/api/registration_fields", (c) => {
    const utils = require(`${__hooks}/utils.js`);
    const registrationType = c.queryParamDefault("type", "student");
    if (["student", "professional"].indexOf(registrationType) === -1) {
        throw new BadRequestError("Type should be professional or student");
    }

    if (!$app.cache().has(`registration_fields_${registrationType}`)) {
        utils.buildRegistrationFields();
    }

    const fields = $app.cache().get(`registration_fields_${registrationType}`);
    return c.json(200, fields);
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

onRecordBeforeCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const data = $apis.requestInfo(e.httpContext).data;

    try {
        // Validate
        utils.validateRelationalData(profileCollectionKey, data[profileDataKey]);
    } catch (e) {
        console.log(e);
        throw new BadRequestError("An error occurred while submitting the form.", e);
    }
}, "registrations");

onRecordAfterCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileKey, profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const data = $apis.requestInfo(e.httpContext).data;

    try {
        const statusRecord = utils.saveRelationalData('registration_statuses', { registrant: e.record.id, status: 'pending' });
        e.record.set('status', statusRecord.id);

        utils.decodeAndSaveProfile(e.record, undefined, profileKey, profileCollectionKey, data[profileDataKey]);
        $app.dao().saveRecord(e.record);
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
