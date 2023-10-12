/// <reference path="../pb_data/types.d.ts" />
/// <reference path="./hooks.d.ts" />

module.exports = {
    generateMerchSensingData() {
        const results = $app.dao().findRecordsByExpr('merch_sensing_data');

        const preferred_offered_merch = {
            id: 'preferred_offered_merch',
            title: 'Preferred offered merch',
            total: 0,
            share: {}
        }

        const other_preferred_offered_merch = {
            id: 'other_preferred_offered_merch',
            title: 'Other preferred offered merch',
            total: 0,
            share: {}
        }

        const merch_spending_limit = {
            id: 'merch_spending_limit',
            title: 'Merch spending limit',
            total: 0,
            share: {}
        }

        for (const result of results) {
            // preferred_offered_merch
            const rawPom = result.getString('preferred_offered_merch');
            if (rawPom) {
                const pom = JSON.parse(rawPom);
                for (const merch of pom) {
                    if (!(merch in preferred_offered_merch.share)) {
                        preferred_offered_merch.share[merch] = 0;
                    }
                    preferred_offered_merch.share[merch]++;
                }
                preferred_offered_merch.total++;
            }

            // other_preferred_offered_merch
            const opm = result.getString('other_preferred_offered_merch');
            if (opm) {
                const splitted_other_preferred_merch = opm.split(',');
                let hasShare = false;
                for (const raw_other_merch of splitted_other_preferred_merch) {
                    const other_merch = raw_other_merch.trim();
                    if (!other_merch || other_merch === 'none') {
                        continue;
                    }

                    hasShare = true;
                    if (!(other_merch in other_preferred_offered_merch.share)) {
                        other_preferred_offered_merch.share[other_merch] = 0;
                    }
                    other_preferred_offered_merch.share[other_merch]++;
                }

                if (hasShare) {
                    other_preferred_offered_merch.total++;
                }
            }

            // merch_spending_limit
            const msl = result.getString('merch_spending_limit');
            if (!(msl in merch_spending_limit.share)) {
                merch_spending_limit.share[msl] = 0;
            }

            merch_spending_limit.share[msl]++;
            merch_spending_limit.total++;
        }

        return {
            total: results.length,
            insights: [
                preferred_offered_merch,
                other_preferred_offered_merch,
                merch_spending_limit
            ]
        }
    },

    /**
     *
     * @param {echo.Context} c
     * @param {string} name
     * @param {any} defaultValue
     * @returns {any}
     */
    getJsonData(c, name, defaultValue = null) {
        const data = $apis.requestInfo(c).data;
        if (name in data && typeof data[name] === 'string') {
            return JSON.parse(data[name]);
        }
        return defaultValue;
    },
    /**
     * @param {string} type
     * @param {string} filter
     * @param {string} host
     * @returns {number} Number of messages sent to recipients.
     */
    sendEmails(type, filter, host = "") {
        const templates = require(`${__hooks}/email_templates.js`);
        const mailTemplate = templates[type];

        const template = $template.loadFiles(
            `${__hooks}/views/emails/layout.html`,
            mailTemplate.path
        );
        const records = filter.length !== 0
            ? $app.dao().findRecordsByFilter("registrations", filter, "-created", -1)
            : arrayOf(new Record);

        if (filter.length === 0) {
            $app.dao().recordQuery("registrations").all(records);
        }

        /**
         * @type {MailerMessage[]}
         */
        const messages = [];

        for (const record of records) {
            const mailParams = mailTemplate.buildParams(record, {
                url: host,
                event_name: "GDG DevFest Davao 2023"
            });

            const output = template.render(mailParams);
            messages.push(new MailerMessage({
                from: {
                    address: $app.settings().meta.senderAddress,
                    name: $app.settings().meta.senderName
                },
                to: [{
                    name: `${record.getString('first_name')} ${record.getString('last_name')}`,
                    address: record.email()
                }],
                subject: mailTemplate.subject(mailParams),
                html: output
            }));
        }

        const mailClient = $app.newMailClient();
        for (const message of messages) {
            mailClient.send(message);
        }

        return messages.length;
    },

    /**
     *
     * @param {'student' | 'professional'} type
     * @returns {RegistrationField[]}
     */
    getRegistrationFields(type) {
        if (["student", "professional"].indexOf(type) === -1) {
            throw new BadRequestError("Type should be professional or student");
        }

        if (!$app.cache().has(`registration_fields_${type}`)) {
            this.buildRegistrationFields();
        }

        return $app.cache().get(`registration_fields_${type}`);
    },

    /**
     * @param {string} collectionKey Collection name/ID of the relational data
     * @param {any} rawData JSON representation of the raw relational data
     * @param {string | undefined} oldId ID of the old record if present
     * @param {daos.Dao} dao
     * @returns {models.Record} Record of the newly created/updated relational data
     */
    saveRelationalData(collectionKey, rawData, oldId, dao = $app.dao()) {
        if (!rawData || Object.keys(rawData).length === 0) {
            return;
        }

        // Assumed that rawData is already validated
        /** @type {models.Record}  */
        let relRecord;

        if (oldId) {
            relRecord = dao.findRecordById(collectionKey, oldId);
            relRecord.load(rawData);
        } else {
            const collection = dao.findCollectionByNameOrId(collectionKey);

            // TODO: use the "Create new record with validations"
            // https://pocketbase.io/docs/js-records/#create-new-record-with-data-validations
            relRecord = new Record(collection, rawData);
        }

        // The rest is on you kid ;)
        dao.saveRecord(relRecord);
        return relRecord;
    },

    /**
     * Validates the given relational data JSON
     *
     * @param {string} collectionKey
     * @param {*} rawData
     * @returns {void}
     */
    validateRelationalData(collectionKey, rawData) {
        if (!rawData || Object.keys(rawData).length === 0 || (Array.isArray(rawData) && rawData.length === 0)) {
            return;
        }

        const collection = $app.dao().findCollectionByNameOrId(collectionKey);

        if (Array.isArray(rawData)) {
            for (const entry of rawData) {
                const relRecord = new Record(collection, entry);
                const form = new RecordUpsertForm($app, relRecord);
                form.validate();
            }
        } else {
            const relRecord = new Record(collection, rawData);
            const form = new RecordUpsertForm($app, relRecord);
            form.validate();
        }
    },

    /**
     *
     * @param {string} type
     * @returns {{profileKey: string, profileDataKey: string, profileCollectionKey: string}}
     */
    getProfileKeys(type) {
        let profileKey = 'student_profile';
        let profileDataKey = 'student_profile_data';
        let profileCollectionKey = 'student_profiles';

        if (type === 'professional') {
            profileKey = 'professional_profile';
            profileDataKey = 'professional_profile_data';
            profileCollectionKey = 'professional_profiles';
        }

        return {
            profileKey,
            profileCollectionKey,
            profileDataKey
        }
    },

    /**
     *
     * @param {models.Record} registrant record of the registrant
     * @param {string} key of the profile
     * @param {string | null} oldProfileId existing ID of profile
     * @param {string} profileKey
     * @param {string} profileCollectionKey Collection key to use for the profile
     * @param {Record<string, any>} rawProfile raw JSON profile string
     * @param {daos.Dao} dao
     * @returns {string}
     */
    decodeAndSaveProfile(registrant, oldProfileId, profileKey, profileCollectionKey, rawProfile, dao = $app.dao()) {
        if (!rawProfile || Object.keys(rawProfile).length !== 0) {
            return;
        }

        const profileRecord = this.saveRelationalData(
            profileCollectionKey,
            {
                registrant: registrant.id,
                ...rawProfile,
            },
            oldProfileId,
            dao
        );

        registrant.set(profileKey, profileRecord.id);
        return profileRecord.id;
    },

    /**
     * @returns {void}
     */
    buildRegistrationFields() {
        console.log("Building registration fields...");

        const registrationTypes = ["student", "professional"];
        const collection = $app.dao().findCollectionByNameOrId("registrations");

        for (const registrationType of registrationTypes) {
            const fields = this.extractCollectionSchema(collection, { registrationType });
            $app.cache().set(`registration_fields_${registrationType}`, fields);
        }
    },

    /**
    *
    * @param {models.Collection | undefined} collection
    * @param {{parent?: string, parentKey?: string, registrationType: string, hidden?: string[]} | undefined} _options
    * @returns {RegistrationField[]}
    */
    extractCollectionSchema(collection, _options) {
        const fieldsFromSchema = collection.schema.fields();

        /**
         * @type {RegistrationField[]}
         */
        const fields = [];

        for (const field of fieldsFromSchema) {
            if (_options.hidden && _options.hidden.indexOf(field.name) !== -1) {
                continue;
            }

            let options = JSON.parse(JSON.stringify(field.options));
            let title = field.name;
            let description = "";
            let shouldExpand = false;
            let group = "";

            options = Object.assign(options, {
                required: field.required
            });

            try {
                const detailRecord = new Record();
                const key = _options.parentKey ? `${_options.parentKey}.${field.name}` : field.name;

                $app.dao().recordQuery("form_details")
                    .where($dbx.hashExp({key}))
                    .one(detailRecord);

                title = detailRecord.getString('title');
                description = detailRecord.getString('description');
                group = detailRecord.getString('form_group');

                const rawCustomOptions = detailRecord.getString("custom_options");
                if (rawCustomOptions.length !== 0) {
                    let customOptions = JSON.parse(rawCustomOptions);

                    if (typeof customOptions === "object") {
                        if ('expand' in customOptions) {
                            shouldExpand = customOptions.expand;
                        }

                        options = {
                            ...options,
                            ...customOptions
                        }
                    }
                }
            } catch (e) {}

            if (typeof options.hidden == "boolean" && options.hidden) {
                continue;
            }

            if (field.type === "relation") {
                // Avoid loop!
                if (typeof _options.parent !== "undefined" && field.options.collectionId === _options.parent) {
                    continue;
                }

                const profileFieldIdx = field.name.lastIndexOf("_profile");
                if (profileFieldIdx !== -1) {
                    if (_options.registrationType && field.name.substring(0, profileFieldIdx) !== _options.registrationType) {
                        continue;
                    }
                }

                if (shouldExpand) {
                    const hiddenFields = Array.isArray(options.hidden) ? options.hidden : [];
                    const relCollection = $app.dao().findCollectionByNameOrId(field.options.collectionId);
                    const relFields = this.extractCollectionSchema(relCollection, {
                        parent: collection.id,
                        parentKey: field.name,
                        registrationType: _options.registrationType,
                        hidden: hiddenFields
                    });

                    fields.push({
                        title,
                        description,
                        group,
                        name: field.name,
                        type: field.type,
                        options: {
                            ...options,
                            fields: relFields
                        }
                    });
                } else {
                    fields.push({
                        title,
                        description,
                        group,
                        name: field.name,
                        type: field.type,
                        options
                    });
                }

                continue;
            }

            if (field.name === "topic_interests") {
                const topicRecords = arrayOf(new Record);

                $app.dao().recordQuery("topic_interests")
                    .all(topicRecords);

                const topics = [];

                for (const topic of topicRecords) {
                    topics.push({
                        name: topic.get("topic_name"),
                        key: topic.get("key")
                    });
                }

                options = { ...options, topics };
            }

            fields.push({
                name: field.name,
                type: field.type,
                group,
                title,
                description,
                options
            });
        }

        return fields;
    }
}
