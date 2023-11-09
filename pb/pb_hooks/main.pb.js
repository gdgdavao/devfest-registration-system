/// <reference path="../pb_data/types.d.ts" />

$app.rootCmd.addCommand(new Command({
    use: "link-missing-merch_sensing_data",
    run: function() {
        let count = 0;

        $app.dao().runInTransaction((txDao) => {
            const result = arrayOf(new DynamicModel({
                'id': '',
                'registrant': ''
            }));

            txDao.db()
                .select('id', 'registrant')
                .from('merch_sensing_data')
                .all(result);

            for (const msd of result) {
                const record = txDao.findRecordById('registrations', msd.registrant);
                if (record.getString('merch_sensing_data').length !== 0) {
                    continue;
                }

                record.set('merch_sensing_data', msd.id);
                txDao.saveRecord(record);

                count++;
            }
        });

        console.log(`${count} were linked successfully.`);
    }
}));

$app.rootCmd.addCommand(new Command({
    use: "link-missing-profiles",
    run: function() {
        const utils = require(`${__hooks}/utils.js`);
        const types = ["student", "professional"];

        let count = 0;

        for (const type of types) {
            const { profileKey, profileCollectionKey } = utils.getProfileKeys(type);
            let countInType = 0;

            $app.dao().runInTransaction((txDao) => {
                const result = arrayOf(new DynamicModel({
                    'id': '',
                    'registrant': ''
                }));

                txDao.db()
                    .select('id', 'registrant')
                    .from(profileCollectionKey)
                    .all(result);

                for (const profile of result) {
                    const record = txDao.findRecordById('registrations', profile.registrant);
                    if (record.getString(profileKey).length !== 0) {
                        continue;
                    }

                    record.set(profileKey, profile.id);
                    txDao.saveRecord(record);

                    countInType++;
                }
            });

            count += countInType;
        }

        console.log(`${count} were linked successfully.`);
    }
}));

$app.rootCmd.addCommand(new Command({
    use: "send-emails",
    run: function(cmd, args) {
        const filter = args[0];
        if (typeof filter === "undefined") {
            throw new Error("Filter is required!");
        }

        let type = args[1];
        if (typeof type === 'undefined') {
            type = 'summary';
        }

        const utils = require(`${__hooks}/utils.js`);
        const host = $app.settings().meta.appUrl;
        const numEmailsSent = utils.sendEmails(type, filter, host);
        console.log(`${numEmailsSent} e-mails were sent successfully.`);
    }
}));

onAfterBootstrap((e) => {
    // Create CSV imports if not present
    // if (e.app.dao().isCollectionNameUnique("csv_imports")) {
    //     const csvImportCollection = new Collection({
    //         name: 'csv_imports',
    //         type: 'base',
    //         schema: [
    //             {
    //                 name: 'file',
    //                 type: 'file',
    //                 required: true,
    //                 options: {
    //                     "maxSelect": 1,
    //                     "maxSize": 10000000,
    //                     "mimeTypes": [],
    //                     "thumbs": null,
    //                     "protected": false // 10mb
    //                 }
    //             },
    //             {
    //                 name: 'columns',
    //                 type: 'json',
    //                 required: true,
    //                 options: {}
    //             }
    //         ]
    //     });

    //     e.app.dao().saveCollection(csvImportCollection);
    // }

    // Initialize custom settings
    if (e.app.dao().isCollectionNameUnique('custom_settings')) {
        const collection = new Collection({
            name: 'custom_settings',
            type: 'base',
            schema: [
                {
                    name: 'key',
                    type: 'text',
                    required: true
                },
                {
                    name: 'value',
                    type: 'json',
                    required: true
                }
            ],
            viewRule: ''
        });

        e.app.dao().saveCollection(collection);

        // Load default settings
        e.app.dao().saveRecord(new Record(collection, {
            key: 'registration_status',
            value: 'open'
        }));
    }

    const utils = require(`${__hooks}/utils.js`);
    utils.buildRegistrationFields();

    if ($os.getenv("PAYMENT_INTENT_API_URL").length === 0) {
        console.error("Warning: PAYMENT_INTENT_API_URL must be set. Some endpoints might not work properly.");
    }

    if ($os.getenv("PAYMONGO_TOKEN").length === 0) {
        console.error("Warning: PAYMONGO_TOKEN must be set. Some endpoints might not work properly.");
    }
});

routerAdd("GET", "/api/registration_fields", (c) => {
    const settings = require(`${__hooks}/settings.js`);

    // Check registration status
    const requestInfo = $apis.requestInfo(c);

    if (!requestInfo.admin) {
        const registrationStatus = settings.getRegistrationStatus();
        if (registrationStatus !== 'open') {
            const registrationStatusTemplate = settings.getSetting('registration_status_templates', {
                closed: {
                    title: 'Registration is closed',
                    subtitle: ''
                }
            });

            return c.json(403, {
                code: 403,
                message: registrationStatusTemplate.closed.title,
                data: Object.assign(registrationStatusTemplate.closed, {
                    type: 'registration_status_' + registrationStatus
                }),
            });
        }
    }

    const utils = require(`${__hooks}/utils.js`);
    const registrationType = c.queryParamDefault("type", "student");
    const formGroup = c.queryParamDefault("group", "all");
    const fields = utils.getRegistrationFields(registrationType);
    return c.json(200, formGroup !== 'all' ? fields.filter(f => f.group === formGroup) : fields);
});

routerAdd("GET", "/api/admin/fields/:collectionId", (c) => {
    const collectionId = c.pathParam("collectionId");
    const collection = $app.dao().findCollectionByNameOrId(collectionId);
    const utils = require(`${__hooks}/utils.js`);
    const expand = c.queryParam("expand").split(",").filter(Boolean);
    const hidden = c.queryParam("hidden").split(",").filter(Boolean);
    const fieldsFromData = utils.extractCollectionSchema2(collection, { expand, hidden });

    return c.json(200, fieldsFromData);
}, $apis.requireAdminAuth());

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
        const emailTemplates = require(`${__hooks}/email_templates.js`);
        const params = new DynamicModel({
            filter: "",
            template: "confirm", // confirm or summary
            force: false
        });

        c.bind(params);

        if (!emailTemplates[params.template]) {
            throw new BadRequestError("Invalid e-mail template ID");
        } else if (params.filter.length === 0 && !params.force) {
            // to avoid accidental deliveries of email to all recipients unless force is true
            throw new BadRequestError("Filter should not be empty.");
        }

        const utils = require(`${__hooks}/utils.js`);
        const host = "http://" + c.request().host;
        const numEmailsSent = utils.sendEmails(params.template, params.filter, host);
        return c.json(200, {"message": `Successfully sent to ${numEmailsSent} e-mails.`});
    } catch (e) {
        console.error(e);
        throw e;
    }
}, $apis.requireAdminAuth());

routerAdd("GET", "/api/admin/screening/:registrantId", (c) => {
    const registrantId = c.pathParam('registrantId');
    const filter = c.queryParam('filter');
    const registrationsCollection = 'registrations';

    // get registrant record
    const registrantRecord = $app.dao().findRecordById(registrationsCollection, registrantId);
    $apis.enrichRecord(c, $app.dao(), registrantRecord, 'status', 'student_profile', 'professional_profile', 'payment', 'addons.addon', 'ticket', 'merch_sensing_data');

    const isNotCurrentUser = `id != "${registrantRecord.id}"`;
    const userRegistered = registrantRecord.created.string();

    // get ids for pagination
    const prevFilter = [isNotCurrentUser, `created >= "${userRegistered}"`, filter.length !== 0 ? `(${filter})` : null].filter(f => f !== null).join(' && ');
    const nextFilter = [isNotCurrentUser, `created < "${userRegistered}"`, filter.length !== 0 ? `(${filter})` : null].filter(f => f !== null).join(' && ');
    const prevRecords = $app.dao().findRecordsByFilter(registrationsCollection, prevFilter, 'created', 1);
    const nextRecords = $app.dao().findRecordsByFilter(registrationsCollection, nextFilter, '-created', 1);

    // NOTE: ids are sorted by ASC (oldest > newest)
    const duplicateRecords = $app.dao().findRecordsByFilter('duplicate_registrations', `occurrences >= 2 && ids ?~ "${registrantRecord.id}"`);

    const paymentRecord = registrantRecord.expandedOne('payment');

    // calculate interest
    let interestRating = 0;
    const interests = JSON.parse(registrantRecord.getString('topic_interests'));
    if (typeof interests === 'object') {
        try {
            const fields = $app.dao().findRecordsByFilter('form_details', 'key = "topic_interests"', '-created', 1);
            if (fields.length >= 1) {
                const fieldValues = JSON.parse(fields[0].getString('custom_options')).values;
                const targetInterests = ['gcp', 'ml', 'android_dev'];

                let total = 0;

                for (const interest of targetInterests) {
                    total += (fieldValues.length - fieldValues.indexOf(interests[interest]));
                }

                interestRating = total / targetInterests.length;
            }
        } catch (e) {}
    }

    // get criteria
    const criteria = [
        {
            id: 'topic_interests',
            label: `Topic interest rating: ${interestRating === Math.floor(interestRating) ? interestRating : interestRating.toFixed(2)}`,
            description: 'How interested is the participant in the topics of the event (GCP, ML, and Android development). Must be greater than or equal to 3.',
            value: interestRating > 3
        },
        {
            id: 'has_duplicates',
            label: 'Is registration unique?',
            description: 'Ensures if there are no duplicate registrations. Ignore this if there are multiple different participants with same names.',
            value: duplicateRecords.length === 0
        },
        {
            id: 'payment',
            label: 'Is payment verified?',
            description: 'Checks if payment has been validated by the team.',
            value: paymentRecord && paymentRecord.getBool('is_verified')
        },
        {
            id: 'type',
            label: 'Is a professional?',
            value: registrantRecord.getString('type') === 'professional'
        },
        {
            id: 'sex',
            label: 'Is a woman (for diversity)?',
            value: registrantRecord.getString('sex') === 'female',
        },
        {
            id: 'addons',
            label: 'Has availed an add-on?',
            value: registrantRecord.getStringSlice('addons').length !== 0,
        }
    ].filter(Boolean);

    return c.json(200, {
        prev_id: prevRecords.length !== 0 ? prevRecords[0].id : null,
        next_id: nextRecords.length !== 0 ? nextRecords[0].id : null,
        record: registrantRecord,
        criteria
    });
}, $apis.requireAdminAuth());

routerAdd("GET", "/payments_redirect", (c) => {
    try {
        const utils = require(`${__hooks}/utils.js`);
        const paymentIntentId = c.queryParam("payment_intent_id");
        if (paymentIntentId.length === 0) {
            console.log("Empty payment intent id");
            throw new BadRequestError();
        }

        const paymentRecords = $app.dao().findRecordsByFilter('payments', `status != "paid" && payment_intent_id = "${paymentIntentId}"`);
        if (paymentRecords.length === 0) {
            throw new BadRequestError("Invalid transaction.");
        }

        const paymentRecord = paymentRecords[0];
        paymentRecord.set('status', 'paid');
        $app.dao().saveRecord(paymentRecord);

        // NOTE: Send summary e-mail here lol
        const host = "http://" + c.request().host;
        // Send e-mail if it was not created from admin dashboard
        utils.sendEmails('summary', `id = "${paymentRecord.getString('registrant')}"`, host);
        return c.html(200, "OK");
    } catch (e) {
        console.error(e);
    }
});

// NOTE: this should be opened in a window with postMessage
routerAdd("POST", "/api/payments/initiate", (c) => {
    try {
        const btoa = require(`${__hooks}/btoa.js`);
        const data = $apis.requestInfo(c).data;
        const registrantId = data.registrant_id;

        // create a payment data first upon registration so that things
        // such as "exp amount" won't be tampered easily
        const paymentId = data.payment_id;
        if (!registrantId || !paymentId) {
            throw new BadRequestError("Registrant ID and payment ID are required.");
        }

        const paymentIntentUrl = $os.getenv("PAYMENT_INTENT_API_URL");
        const paymongoToken = $os.getenv("PAYMONGO_TOKEN");

        if (paymentIntentUrl.length === 0) {
            throw new ApiError(500, "PAYMENT_INTENT_API_URL must be set");
        } else if (paymongoToken.length === 0) {
            throw new ApiError(500, "PAYMONGO must be set");
        }

        const record = $app.dao().findRecordById("registrations", registrantId);
        const paymentRecord = $app.dao().findRecordById("payments", paymentId);
        const apiKey = btoa(paymongoToken);

        // 1. Create payment intent
        const resp = $http.send({
            url: `${paymentIntentUrl}/payment`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: registrantId,
                email: record.email(),
                cost: paymentRecord.getInt('expected_amount') * 100
            })
        });

        if (!resp.json.success) {
            console.error(resp.raw);
            throw new ApiError(500, "Something went wrong while processing your payments. [1]");
        }

        /** @type {string} */
        const clientKey = resp.json.data.client_key;
        const paymentIntentId = clientKey.split('_client')[0];
        paymentRecord.set('payment_intent_id', paymentIntentId);
        $app.dao().saveRecord(paymentRecord);

        // 2. Create payment method
        // 3. Attach payment method to payment intent
        // 4. Redirecting the customer for authentication
        // NOTE: It's up to the frontend for this
        // const paymentIntent = attachResp.json.data;
        return c.json(200, {
            api_key: apiKey,
            client_key: clientKey,
            payment_intent_id: paymentIntentId,
            endpoints: {
                create_payment_method: 'https://api.paymongo.com/v1/payment_methods',
                attach_payment_intent: `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
                payment_intent: `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`
            }
        });
    } catch(e) {
        console.error(e);
        throw e;
    }
});

routerAdd("GET", "/api/payment-methods", (c) => {
    return c.json(200, [
        // {
        //     id: "card",
        //     label: "Credit Card",
        //     processorRate: 0.035,
        //     extraProcessorFee: 15
        // },
        {
            id: "gcash",
            label: "GCash",
            processorRate: 0.0,
            extraProcessorFee: 0
        },
        // {
        //     id: "paymaya",
        //     label: "Maya",
        //     processorRate: 0.02,
        //     extraProcessorFee: 0
        // }
    ]);
});

routerAdd("GET", "/api/email_templates", (c) => {
    const emailTemplates = require(`${__hooks}/email_templates.js`);
    const templatesList = [];

    for (const templateId in emailTemplates) {
        const template = emailTemplates[templateId];
        templatesList.push({
            name: template.name ? template.name : templateId,
            id: templateId
        });
    }

    return c.json(200, templatesList);
}, $apis.requireAdminAuth());

// routerAdd("POST", "/csv/import", (c) => {
//     const data = $apis.requestInfo(c).data;
//     const importId = data["import_id"];
//     if (!importId) {
//         throw new BadRequestError()
//     }

//     const mappings = data["mappings"];
//     if (typeof mappings !== 'object') {
//         throw new BadRequestError("Mappings should be an object of strings.")
//     }

//     const importEntry = $app.dao().findRecordById('csv_imports', importId);
//     const collection = data["collection"];
//     if (!collection) {
//         throw new BadRequestError("Collection ID or name must be provided.");
//     }

//     const fileKey = importEntry.baseFilesPath() + "/" + importEntry.getString("file");
//     const csvFile = $filesystem.fileFromPath(fileKey);
//     const csvData = readerToString(csvFile.reader.open());
//     const n = utils.importCsv(collection, csvData, mappings);

//     return c.json(200, { message: `${n} records were imported successfully.` })
// });

// routerAdd("POST", "/csv/initial-import", (c) => {
//     const rawCsvFile = c.formFile("csv");
//     if (rawCsvFile.header.get("Content-Type") != "text/csv") {
//         throw new BadRequestError("Invalid file type. Must be a file with CSV format.");
//     }

//     const csvFile = $filesystem.fileFromMultipart(rawCsvFile);
//     const csvData = readerToString(csvFile.reader.open());
//     const csv = require(`${__hooks}/csv_parser.js`);
//     const rows = csv.parseCSV(csvData);
//     const headers = rows[0];

//     const collection = $app.dao().findCollectionByNameOrId('csv_imports');
//     const record = new Record(collection);
//     const form = new RecordUpsertForm($app, record);
//     form.loadData({ columns: headers });
//     form.addFiles('file', csvFile);
//     form.submit();

//     return c.json(200, record);
// }, $apis.requireAdminAuth());

routerAdd("GET", "/csv/export", (c) => {
    try {
        const collection = c.queryParam("collection");
        if (!collection) {
            throw new BadRequestError('Collection name or ID must be provided.');
        }

        const utils = require(`${__hooks}/utils.js`);
        const filter = c.queryParam("filter");
        const expand = c.queryParam("expand").split(",").filter(Boolean);
        const output = utils.exportToCsv(collection, expand, filter);

        c.response().header().set("Content-Type", "text/csv");
        c.response().header().set("Content-Disposition", `attachment; filename=${collection}-${(new Date).getTime()}.csv`);
        c.response().write(output);
        return null;
    } catch(e) {
        console.error(e);
        throw e;
    }
});

routerAdd("GET", "/assets/*", $apis.staticDirectoryHandler(`${__hooks}/assets`, false));

// Summary API
routerAdd("GET", "/api/summary", (c) => {
    let format = c.queryParam("format");
    if (!format) {
        format = 'json';
    }

    if (format !== 'json' && format !== 'csv') {
        throw new BadRequestError('Format should be json or csv');
    }

    const collectionId = c.queryParam("collection");
    if (!collectionId) {
        throw new BadRequestError("Collection ID or name is required.");
    }

    const collection = $app.dao().findCollectionByNameOrId(collectionId);
    const exceptColumns = c.queryParam("except").split(",").filter(Boolean);
    const splittableColumns = c.queryParam("splittable").split(",").filter(Boolean);

    const filter = c.queryParam("filter");
    const expand = c.queryParam("expand").split(",").filter(Boolean);

    const records = filter.length > 0 ?
        $app.dao().findRecordsByFilter(collectionId, filter) :
        $app.dao().findRecordsByExpr(collectionId);

    if (expand.length > 0) {
        $app.dao().expandRecords(records, expand, null);
    }

    const utils = require(`${__hooks}/utils.js`);
    const results = utils.generateSummary(collection, records, {
        filter,
        exceptColumns,
        splittableColumns,
        expand
    });

    if (format === 'csv') {
        const output = results.insights.map(i => {
            const sorted = Object.entries(i.share)
                .sort((a, b) => a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1);
            return `
    ${i.title},\n${sorted.map(([entry, count]) => `"${entry}",${count}`).join('\n')}
    ,
        `.trim();
        }).join('\n');

        c.response().header().set("Content-Type", "text/csv");
        c.response().header().set("Content-Disposition", `attachment; filename=merch_sensing_data-${(new Date).getTime()}.csv`);
        c.response().write(output);
        return null;
    }

    // Generate csv export URL
    c.queryParams().set('format', 'csv');
    const exportCsvEndpoint = '/api/summary?' + c.queryParams().encode();

    return c.json(200, Object.assign(
        results,
        {
            csv_endpoint: exportCsvEndpoint
        }
    ));
});

/**
 *
 * @param {echo.HandlerFunc} next
 * @returns {echo.HandlerFunc}
 */
function loadAdminContextViaQuery(next) {
    return (c) => {
        const token = c.queryParam("token")
        if (token.length == 0) {
            return next(c);
        }

        const admin = $app.dao().findAdminByToken(token, $app.settings().adminAuthToken.secret);
        c.set("admin", admin)
        return next(c);
    }
}

routerAdd("GET", "/admin/addon_orders/export", (c) => {
    const filter = c.queryParam("filter");
    const records = $app.dao().findRecordsByFilter(
        "registrations",
        "addons:length >= 1" + (filter.length !== 0 ? ` && (${filter})` : ''),
        "-last_name",
        0
    )

    $apis.enrichRecords(c, $app.dao(), records, 'addons.addon');
    let output = 'Last Name,First Name,Add-on,Add-on Preference\n';

    for (const record of records) {
        const orderRecords = record.expandedAll('addons')

        for (const order of orderRecords) {
            const addon = order.expandedOne('addon');
            const rawPrefs = order.getString('preferences');
            const preferences = rawPrefs.length != 0 ? JSON.parse(rawPrefs) : {};

            output += [
                record.getString('last_name'),
                record.getString('first_name'),
                addon.getString('title'),
                Object.entries(preferences).map(p => `${p[0]}: ${p[1]}`).join(' | ')
            ].join(',') + '\n';
        }
    }

    c.response().header().set("Content-Type", "text/csv");
    c.response().header().set("Content-Disposition", `attachment; filename=addon_orders-${(new Date).getTime()}.csv`);
    c.response().write(output);
    return null;
}, loadAdminContextViaQuery, $apis.requireAdminAuth());

onRecordBeforeCreateRequest((e) => {
    const settings = require(`${__hooks}/settings.js`);
    if (!$apis.requestInfo(e.httpContext).admin && settings.getRegistrationStatus() !== 'open') {
        throw new ForbiddenError('Registration is closed.');
    }

    const utils = require(`${__hooks}/utils.js`);
    const { profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const profile_data = utils.getJsonData(e.httpContext, profileDataKey);
    const addons_data = utils.getJsonData(e.httpContext, "addons_data", []);
    const payment_data = utils.getJsonData(e.httpContext, "payment_data");
    const merch_sensing_data_data = utils.getJsonData(e.httpContext, "merch_sensing_data_data");

    try {
        // Validate
        utils.validateRelationalData('addon_orders', addons_data);
        utils.validateRelationalData('manual_payments', payment_data);
        utils.validateRelationalData(profileCollectionKey, profile_data);
        utils.validateRelationalData('merch_sensing_data', merch_sensing_data_data);
    } catch (e) {
        console.log(e);
        throw new BadRequestError("An error occurred while submitting the form.", e);
    }
}, "registrations");

onRecordAfterCreateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileKey, profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));

    try {
        const profile_data = utils.getJsonData(e.httpContext, profileDataKey)
        const addons_data = utils.getJsonData(e.httpContext, "addons_data", []);
        // const payment_data = utils.getJsonData(e.httpContext, "payment_data");
        const merch_sensing_data_data = utils.getJsonData(e.httpContext, "merch_sensing_data_data");

        $app.dao().runInTransaction((txDao) => {
            const addonOrders = addons_data ? addons_data.map(a => {
                const addonOrder = utils.saveRelationalData('addon_orders',
                    Object.assign({ registrant: e.record.id }, a), undefined, txDao);
                return addonOrder.id;
            }) : [];
            e.record.set('addons', addonOrders);

            /** @type {models.Record} */
            // const paymentRecord = utils.saveRelationalData('manual_payments',
            //     Object.assign({
            //         registrant: e.record.id,
            //         status: 'paid',
            //     }, payment_data), undefined, txDao);

            // const form = new RecordUpsertForm($app, paymentRecord);
            // form.addFiles("receipt", e.httpContext.formFile("payment_data.receipt"));
            // form.submit();

            // e.record.set('payment', paymentRecord.id);

            const statusRecord = utils.saveRelationalData('registration_statuses', { registrant: e.record.id, status: 'pending' }, undefined, txDao);
            e.record.set('status', statusRecord.id);

            if (merch_sensing_data_data) {
                const merchSensingDRecord = utils.saveRelationalData('merch_sensing_data', Object.assign({ registrant: e.record.id }, merch_sensing_data_data), undefined, txDao);
                e.record.set('merch_sensing_data', merchSensingDRecord.id);
            }

            utils.decodeAndSaveProfile(e.record, undefined, profileKey, profileCollectionKey, profile_data, txDao);
            txDao.saveRecord(e.record);
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
}, "registrations");

onRecordBeforeUpdateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const { profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const profile_data = utils.getJsonData(e.httpContext, profileDataKey);
    const merch_sensing_data_data = utils.getJsonData(e.httpContext, "merch_sensing_data_data");

    try {
        // Validate
        utils.validateRelationalData(profileCollectionKey, profile_data);
        utils.validateRelationalData('merch_sensing_data', merch_sensing_data_data);
    } catch (e) {
        console.log(e);
        throw new BadRequestError("An error occurred while submitting the form.", e);
    }
}, "registrations");

onRecordAfterUpdateRequest((e) => {
    const utils = require(`${__hooks}/utils.js`);
    const registrant = e.record.id;
    const { profileKey, profileCollectionKey, profileDataKey } = utils.getProfileKeys(e.record.getString('type'));
    const profile_data = utils.getJsonData(e.httpContext, profileDataKey);
    const merch_sensing_data_data = utils.getJsonData(e.httpContext, "merch_sensing_data_data");

    try {
        $app.dao().runInTransaction((txDao) => {
            if (profile_data && Object.keys(profile_data).length !== 0) {
                let oldProfileId = null;

                // Get opposite keys
                let { profileKey: oppositeProfileKey, profileCollectionKey: oppositeProfileCKey } =
                    utils.getProfileKeys(e.record.getString('type') === 'student' ? 'professional' : 'student');

                // If a user mistakenly selects $type but is a $oppositeType, delete existing record of it
                const oppositeProfileId = e.record.getString(oppositeProfileKey);
                if (oppositeProfileId.length !== 0) {
                    e.record.set(oppositeProfileKey, null);
                    txDao.saveRecord(e.record);

                    const oldProfile = txDao.findRecordById(oppositeProfileCKey, oppositeProfileId);
                    txDao.deleteRecord(oldProfile);
                } else {
                    oldProfileId = e.record.getString(profileKey);

                    // If oldProfile is still empty, make it null again
                    if (oldProfileId && oldProfileId.length === 0) {
                        oldProfileId = null;
                    }
                }

                // Create and save to record
                utils.decodeAndSaveProfile(registrant, oldProfileId, profileKey, profileCollectionKey, profile_data);
            }

            if (merch_sensing_data_data) {
                const merchSensingDRecord = utils.saveRelationalData('merch_sensing_data', merch_sensing_data_data, e.record.getString('merch_sensing_data'), txDao);
                e.record.set('merch_sensing_data', merchSensingDRecord.id);
            }

            txDao.saveRecord(e.record);
        });

        try {
            console.error('ERROR SENDING E-MAIL');

            if (e.record.getString(profileKey).length != 0 && e.record.getString('payment').length != 0) {
                const host = "http://" + e.httpContext.request().host;
                // Send e-mail if it was not created from admin dashboard
                utils.sendEmails('summary', `id = "${e.record.id}"`, host);
            }
        } catch (e) {
            console.error(e);
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
}, "registrations");

onCollectionAfterUpdateRequest((e) => {
    if (e.collection.name === "registrations") {
        const utils = require(`${__hooks}/utils.js`);
        utils.buildRegistrationFields();

        $app.cache().remove(`fields_${e.collection.id}`)
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
