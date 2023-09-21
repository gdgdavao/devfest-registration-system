/// <reference path="../pb_data/types.d.ts" />

module.exports = {
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
     * @param {string} registrant ID of the registrant
     * @param {string | null} oldProfileId existing ID of profile
     * @param {string} profileCollectionKey Collection key to use for the profile
     * @param {Record<string, any>} rawProfile raw JSON profile string
     * @returns {string}
     */
    decodeAndSaveProfile(registrant, oldProfileId, profileCollectionKey, rawProfile) {
        let profileRecord;
        
        if (oldProfileId) {
            profileRecord = $app.dao().findRecordById(profileCollectionKey, oldProfileId);
            profileRecord.load(rawProfile);
        } else {
            const profileCollection = $app.dao().findCollectionByNameOrId(profileCollectionKey);
            // TODO: use the "Create new record with validations"
            // https://pocketbase.io/docs/js-records/#create-new-record-with-data-validations
            const profileRecord = new Record(profileCollection, rawProfile);
            profileRecord.set('registrant', registrant);
        }

        $app.dao().saveRecord(profileRecord);        
        return profileRecord.id;
    },

    /**
     * @returns {void}
     */
    buildRegistrationFields() {
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
                    const customOptions = JSON.parse(rawCustomOptions);
                    if (typeof customOptions === "object") {
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

                    const profileCollection = $app.dao().findCollectionByNameOrId(field.options.collectionId);
                    const profileFields = this.extractCollectionSchema(profileCollection, {
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
                            fields: profileFields
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
