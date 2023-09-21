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
        if (data[profileDataKey] && Object.keys(data[profileDataKey]).length !== 0) {
            const profileCollection = $app.dao().findCollectionByNameOrId(profileCollectionKey);
            const rawProfile = data[profileDataKey];
            const profileRecord = new Record(profileCollection, rawProfile);
            
            // For validation
            const form = new RecordUpsertForm($app, profileRecord);
            form.validate();
        }
    } catch (e) {
        console.log(e);
        throw new BadRequestError("An error occurred while submitting the form.", e);
    }
}, "registrations");

onRecordAfterCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const registrant = e.record.id;
    const { profileKey, profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const data = $apis.requestInfo(e.httpContext).data;

    try {
        const statusCollection = $app.dao().findCollectionByNameOrId('registration_statuses');
        const statusRecord = new Record(statusCollection, { registrant, status: 'pending' });

        $app.dao().saveRecord(statusRecord);
        e.record.set('status', statusRecord.id);

        if (data[profileDataKey] && Object.keys(data[profileDataKey]).length !== 0) {
            const profileId = utils.decodeAndSaveProfile(registrant, profileCollectionKey, data[profileDataKey]);
            e.record.set(profileKey, profileId);
        }

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
        console.log(data);
        if (data[profileDataKey] && Object.keys(data[profileDataKey]).length !== 0) {
            const profileCollection = $app.dao().findCollectionByNameOrId(profileCollectionKey);
            const rawProfile = data[profileDataKey];
            const profileRecord = new Record(profileCollection, rawProfile);
            
            // For validation
            const form = new RecordUpsertForm($app, profileRecord);
            form.validate();
        }
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

            if (e.record.getString('type') === 'student') {
                // If a user mistakenly selects professional but is a student, delete existing record of it
                const proProfileId = e.record.getString('professional_profile');
                if (proProfileId.length !== 0) {
                    e.record.set('professional_profile', null);
                    $app.dao().saveRecord(e.record);

                    const oldProfile = $app.dao().findRecordById('professional_profiles', proProfileId);
                    $app.dao().deleteRecord(oldProfile);
                } else {
                    oldProfileId = e.record.getString('student_profile');
                }
            } else {
                // If a user mistakenly selects student but is a professional, delete existing record of it
                const studentProfileId = e.record.getString('student_profile');
                if (studentProfileId.length !== 0) {
                    e.record.set('student_profile', null);
                    $app.dao().saveRecord(e.record);
                    
                    const oldProfile = $app.dao().findRecordById('student_profiles', studentProfileId);
                    $app.dao().deleteRecord(oldProfile);
                } else {
                    oldProfileId = e.record.getString('professional_profile');
                }
            }

            // If oldProfile is still empty, make it null again
            oldProfileId = null;
            
            // Create and save to record
            const profileId = utils.decodeAndSaveProfile(registrant, oldProfileId, profileCollectionKey, data[profileDataKey]);
            e.record.set(profileKey, profileId);
        }

        $app.dao().saveRecord(e.record);
    } catch (e) {
        console.error(e);
        throw e;
    }
}, "registrations");

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