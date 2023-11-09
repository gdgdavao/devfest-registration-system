module.exports = {
    getSetting(key, defaultValue = null) {
        try {
            const records = $app.dao().findRecordsByExpr('custom_settings', $dbx.hashExp({key}));
            if (!records || records.length === 0) {
                return defaultValue;
            }
            const record = records[0];
            if (!record.getString('value')) {
                return defaultValue;
            }
            return JSON.parse(record.getString('value'));
        } catch (e) {
            return defaultValue;
        }
    },
    getRegistrationStatus() {
        return this.getSetting('registration_status', 'closed');
    }
}
