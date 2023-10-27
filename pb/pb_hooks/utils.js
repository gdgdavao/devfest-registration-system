/// <reference path="../pb_data/types.d.ts" />
/// <reference path="./hooks.d.ts" />

module.exports = {
    sortSummary(a, b) {
        return a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1;
    },

    /**
     * Returns a summary data of a given collection
     * @param {models.Collection} collection Collection name or ID
     * @param {(models.Record | undefined)[]} records List of records
     * @param {Record<string, unknown>} options Summary generation options
     * @param {string[]} options.parentCollectionIds Parent collection ID;
     * @param {string[]} options.exceptColumns Columns to be excluded
     * @param {string[]} options.splittableColumns String columns that can are separated by comma
     * @param {string[]} options.expand Columns to be expanded
     * @param {{total: number, insights: any[]}[]} options.insights Existing insights data from summary
     * @returns {{total: number, insights: any[]}}
     */
    generateSummary(collection, records, options = { exceptColumns: [], splittableColumns: [], expand: [] }) {
        /** @type {string[]} */
        const exceptColumns = options.exceptColumns ? options.exceptColumns : [];
        /** @type {string[]} */
        const splittableColumns = options.splittableColumns ? options.splittableColumns : [];
        /** @type {string[]} */
        const expand = options.expand ? options.expand : [];

        const fields = collection.schema.fields().filter(f => {
            if (f.type !== 'relation') {
                return true;
            }

            if (options.parentCollectionIds && options.parentCollectionIds.includes(f.options.collectionId)) {
                return false;
            }

            return expand.includes(f.name);
        }).map(f => ({
            system: f.system,
            name: f.name,
            type: f.type,
            options: f.options
        }));

        // include filtering system columns
        const systemColumns = fields.filter(f => f.system).map(f => f.name);
        for (const col of systemColumns) {
            exceptColumns.push(col);
        }

        let total = 0;
        /** @type {{id: string, title: string, total: number, insights: any[]}[]} */
        let results = options.insights && options.insights.length !== 0 ? options.insights : fields
            .filter(f => !exceptColumns.includes(f.name)).map(col => ({
                id: col.name,
                title: col.name,
                type: col.type,
                total: 0,
                share: {}
            }));

        const expandableResults = {};
        const expandedCollections = {};

        const tallyValue = function(result, rawV) {
            const value = typeof rawV === 'string' ? rawV.trim() : rawV;
            if (!value) return 0;
            if (!(value in result.share)) {
                result.share[value] = 0;
            }
            result.share[value]++;
            return 1;
        }

        for (const rawRecord of records) {
            for (let i = 0; i < results.length; i++) {
                const col = results[i].id;
                const value = rawRecord.getString(col);
                if (!value) {
                    continue;
                }

                const schemaField = fields.find(f => f.name === col);
                if (!schemaField) {
                    continue;
                }

                let added = 0;
                if (schemaField.type === 'relation' && expand.includes(col) && rawRecord.expandedOne(col)) {
                    if (!(col in expandedCollections)) {
                        expandedCollections[col] = $app.dao().findCollectionByNameOrId(schemaField.options.collectionId);
                    }

                    const prefix = `${schemaField.name}.`;
                    const expanded = rawRecord.expandedOne(col);
                    const expandedResults = this.generateSummary(
                        expandedCollections[col],
                        [expanded],
                        {
                            parentCollectionIds: !options.parentCollectionIds ? [collection.id] : options.parentCollectionIds.concat(collection.id),
                            exceptColumns: exceptColumns
                                .filter(c => c.indexOf(prefix) === 0)
                                .map(c => c.substring(prefix.length)),
                            splittableColumns: splittableColumns
                                .filter(c => c.indexOf(prefix) === 0)
                                .map(c => c.substring(prefix.length)),
                            expand: expand
                                .filter(c => c.indexOf(prefix) === 0)
                                .map(c => c.substring(prefix.length)),
                            insights: expandableResults[schemaField.name] ? expandableResults[schemaField.name] : []
                        }
                    );

                    if (!(schemaField.name in expandableResults)) {
                        expandableResults[schemaField.name] = expandedResults.insights;
                    }
                } else if (schemaField.type === 'json') {
                    const value = JSON.parse(rawRecord.getString(col));
                    if (Array.isArray(value)) {
                        for (const v of value) {
                            added += tallyValue(results[i], v);
                        }
                    } else if (typeof value === 'object') {
                        for (const key in value) {
                            if (!results[i].share[key]) {
                                results[i].share[key] = { share: {} };
                            }
                            const v = value[key];
                            added += tallyValue(results[i].share[key], v);
                        }
                    }
                } else if (splittableColumns.includes(col) && typeof value === 'string') {
                    const values = value.split(',');
                    for (const v of values) {
                        added += tallyValue(results[i], v.trim());
                    }
                } else {
                    added += tallyValue(results[i], value);
                }

                if (added > 0) {
                    results[i].total++;
                }
            }

            total++;
        }

        // Insert the summary data of expanded fields
        if (expand.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const col = results[i].id;
                if (!(col in expandableResults)) {
                    continue;
                }

                const rightSide = results.slice(i + 1);
                const final = expandableResults[col]
                    .map(i => Object.assign(i, {
                        id: `${col}.${i.id}`,
                        title: `${col}.${i.title}`
                    }));

                results = results.slice(0, i - 1)
                    .concat(...final)
                    .concat(...rightSide);
            }
        }

        // Convert the "share" dict to array
        if (!options.insights || !options.insights.length === 0) {
            for (let i = 0; i < results.length; i++) {
                const entries = Object.entries(results[i].share);
                if (entries.length === 0) {
                    continue;
                }

                if (typeof entries[0][1] === 'number') {
                    results[i].share = entries.sort(this.sortSummary)
                        .map((e) => ({ value: e[0], count: e[1] }));;
                } else if (typeof entries[0][1] === 'object') {
                    // For nested data, it should go here
                    results[i].share = entries.map((e) => {
                        return {
                            value: e[0],
                            entries: Object.entries(e[1].share)
                                .sort(this.sortSummary)
                                .map(ee => ({ value: ee[0], count: ee[1] }))
                        };
                    });
                }
            }
        }

        return {
            total,
            insights: results
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
    * @param {{parent?: string, parentKey?: string, registrationType: string, hidden?: string[]} | undefined, showHidden: boolean} _options
    * @returns {RegistrationField[]}
    */
    extractCollectionSchema(collection, _options) {
        if (!_options) {
            _options = {
                showHidden: false
            };
        }

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

            if (!_options.showHidden && (typeof options.hidden == "boolean" && options.hidden)) {
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
                        hidden: hiddenFields,
                        showHidden: _options.showHidden
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
