/// <reference path="../pb_data/types.d.ts" />

module.exports = {
    /**
     * @param {string} collectionKey Collection name/ID of the relational data
     * @param {any} rawData JSON representation of the raw relational data
     * @param {string | undefined} oldId ID of the old record if present
     * @returns {models.Record} Record of the newly created/updated relational data
     */
    saveRelationalData(collectionKey, rawData, oldId) {
        if (!rawData || Object.keys(rawData).length === 0) {
            return;
        }

        // Assumed that rawData is already validated
        /** @type {models.Record}  */
        let relRecord;

        if (oldId) {
            relRecord = $app.dao().findRecordById(collectionKey, oldId);
            relRecord.load(rawData);
        } else {
            const collection = $app.dao().findCollectionByNameOrId(collectionKey);

            // TODO: use the "Create new record with validations"
            // https://pocketbase.io/docs/js-records/#create-new-record-with-data-validations
            relRecord = new Record(collection, rawData);
        }

        // The rest is on you kid ;)
        $app.dao().saveRecord(relRecord);
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
        if (!rawData || Object.keys(rawData).length === 0) {
            return;
        }

        const collection = $app.dao().findCollectionByNameOrId(collectionKey);
        const relRecord = new Record(collection, rawData);
        const form = new RecordUpsertForm($app, relRecord);
        form.validate();
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
     * @returns {string}
     */
    decodeAndSaveProfile(registrant, oldProfileId, profileKey, profileCollectionKey, rawProfile) {
        if (!rawProfile || Object.keys(rawProfile).length !== 0) {
            return;
        }

        const profileRecord = this.saveRelationalData(
            profileCollectionKey,
            {
                registrant: registrant.id,
                ...rawProfile,
            },
            oldProfileId
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
    * @param {{parent?: string, parentKey?: string, registrationType: string} | undefined} _options
    */
    extractCollectionSchema(collection, _options) {
        const fieldsFromSchema = collection.schema.fields();
        const fields = [];

        for (const field of fieldsFromSchema) {
            let options = JSON.parse(JSON.stringify(field.options));
            let title = field.name;
            let description = "";
            let shouldExpand = false;

            try {

                const detailRecord = new Record();
                const key = _options.parentKey ? `${_options.parentKey}.${field.name}` : field.name;

                $app.dao().recordQuery("form_details")
                    .where($dbx.hashExp({key}))
                    .one(detailRecord);

                title = detailRecord.getString('title');
                description = detailRecord.getString('description');

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

            if (options.hidden) {
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
                    const relCollection = $app.dao().findCollectionByNameOrId(field.options.collectionId);
                    const relFields = this.extractCollectionSchema(relCollection, {
                        parent: collection.id,
                        parentKey: field.name,
                        registrationType: _options.registrationType
                    });

                    fields.push({
                        title,
                        description,
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
                title,
                description,
                options
            });
        }

        return fields;
    }
}
