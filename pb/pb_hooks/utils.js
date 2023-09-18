/// <reference path="../pb_data/types.d.ts" />

module.exports = {
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
