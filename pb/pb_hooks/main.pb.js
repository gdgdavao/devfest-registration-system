/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/registration_fields", (c) => {
    const utils = require(`${__hooks}/utils.js`);
    const registrationType = c.queryParamDefault("type", "student");
    if (["student", "professional"].indexOf(registrationType) === -1) {
        throw new BadRequestError("Type should be professional or student");
    }

    const collection = $app.dao().findCollectionByNameOrId("registrations");
    const fields = utils.extractCollectionSchema(collection, { excluded: ["is_approved"], registrationType });

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

onRecordAfterCreateRequest((e) => {
    try {
        let profileKey = 'student_profile';
        let profileDataKey = 'student_profile_data';
        let profileCollectionKey = 'student_profiles';
        let registrantKey = 'registrant';

        if (e.record.getString('type') === 'professional') {
            profileKey = 'professional_profile';
            profileDataKey = 'professional_profile_data';
            profileCollectionKey = 'professional_profiles';
        }

        const profileCollection = $app.dao().findCollectionByNameOrId(profileCollectionKey);
        const rawProfile = JSON.parse(e.httpContext.formValue(profileDataKey));

        // TODO: use the "Create new record with validatoins"
        // https://pocketbase.io/docs/js-records/#create-new-record-with-data-validations
        const profileRecord = new Record(profileCollection, rawProfile);
        profileRecord.set(registrantKey, e.record.id);
        $app.dao().saveRecord(profileRecord);

        e.record.set(profileKey, profileRecord.id);
        $app.dao().saveRecord(e.record);
    } catch (e) {
        console.error(e);
    }
}, "registrations");
