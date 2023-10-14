module.exports = {
    summary: {
        name: 'Form summary',
        path: `${__hooks}/views/emails/summary.html`,
        /**
         *
         * @param {models.Record} record
         * @param {Record<string, any>} existingParams
         */
        buildParams(record, existingParams) {
            const utils = require(`${__hooks}/utils.js`);
            /** @type {RegistrationField[]} */
            const fields = utils.getRegistrationFields(record.getString('type'));
            const data = [];

            for (const field of fields) {
                if (field.type === 'relation' && field.name === 'addons') {
                    const addonIds = record.getStringSlice(field.name);
                    const relRecord = $app.dao().findRecordsByIds(field.options.collectionId, addonIds);

                    data.push({
                        name: field.name,
                        title: field.title,
                        type: field.type,
                        value: addonIds,
                        entries: relRecord.map(record => {
                            const addonRecord = $app.dao().findRecordById('addons', record.getString('addon'));
                            const prefs = record.getString('preferences');

                            return {
                                value: `1 x ${addonRecord.getString('title')} ${prefs && '(' + Object.entries(JSON.parse(prefs)).map(e => `${e[0]}: ${e[1]}`).join(', ') + ')'}`,
                            }
                        })
                    });
                } else if (field.type === 'relation' && field.name === 'ticket') {
                    const relRecord = $app.dao().findRecordById(field.options.collectionId, record.getString(field.name));
                    data.push({
                        name: field.name,
                        title: field.title,
                        type: field.type,
                        value: `${relRecord.getString('name')} (₱${relRecord.getInt('price')})`,
                    });
                } else if (field.type === 'relation' && field.name === 'payment') {
                    const relRecord = $app.dao().findRecordById(field.options.collectionId, record.getString(field.name));
                    data.push({
                        name: field.name,
                        title: "Amount Paid",
                        type: field.type,
                        value: `₱${relRecord.getInt('expected_amount')}`,
                    });
                } else if (field.type === 'relation' && field.options.expand) {
                    const relIds = record.getStringSlice(field.name);
                    if (relIds.length === 0) {
                        const relId = record.getString(field.name);
                        if (relId) {
                            relIds.push(relId);
                        }
                    }

                    const entries = [];
                    for (const relId of relIds) {
                        const relRecord = $app.dao().findRecordById(field.options.collectionId, relId);
                        const subdata = [];

                        for (const subfield of field.options.fields) {
                            if (subfield.options.hidden_email) {
                                continue;
                            }

                            if (subfield.type === "json") {
                                const value = JSON.parse(relRecord.getString(subfield.name));
                                subdata.push({
                                    name: subfield.name,
                                    title: subfield.title,
                                    type: subfield.type,
                                    value: Array.isArray(value) ? value.join(', ') : value,
                                    options: subfield.options
                                });
                            } else {
                                subdata.push({
                                    name: subfield.name,
                                    title: subfield.title,
                                    type: subfield.type,
                                    value: relRecord.getString(subfield.name),
                                });
                            }
                        }

                        entries.push({
                            value: relId,
                            fields: subdata
                        });
                    }

                    data.push({
                        name: field.name,
                        title: field.title,
                        type: field.type,
                        value: relIds,
                        entries
                    });
                } else if (field.type === "json") {
                    data.push({
                        name: field.name,
                        title: field.title,
                        type: field.type,
                        value: JSON.parse(record.getString(field.name)),
                        options: field.name === 'topic_interests' ? {
                            labels: field.options.topics.map(t => [t.key, t.name]).reduce((pv, cv) => {
                                pv[cv[0]] = cv[1];
                                return pv;
                            }, {})
                        } : field.options
                    });
                } else {
                    data.push({
                        name: field.name,
                        title: field.title,
                        type: field.type,
                        value: record.getString(field.name),
                    });
                }
            }

            return Object.assign(existingParams, {
                data
            });
        },
        subject(params) {
            return "Thank you for registering!";
        },
    },
    confirm: {
        name: 'Registration confirmation',
        path: `${__hooks}/views/emails/confirm.html`,
        /**
        *
        * @param {models.Record} record
        * @param {Record<string, any>} existingParams
        */
        buildParams(record, existingParams) {
            const statusRecord = $app.dao().findRecordById('registration_statuses', record.getString('status'));

            return Object.assign(existingParams, {
                first_name: record.getString('first_name'),
                status: statusRecord.getString('status')
            });
        },
        subject(params) {
            if (params.status === 'approved') {
                return `You're selected to attend ${params.event_name}`
            } else if (params.status === 'rejected') {
                return `We are sorry, ${params.first_name}`;
            }
            return 'Should not be sent.';
        }
    }
}
