module.exports = {
    /**
     *
     * @param {string} csv
     * @returns {string[][]}
     */
    parseCSV(csv) {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let insideQuotes = false;

        function pushField() {
            currentRow.push(currentField);
            currentField = '';
        }

        for (let i = 0; i < csv.length; i++) {
            const char = csv[i];
            const nextChar = csv[i + 1];

            if (char === '"') {
                if (insideQuotes) {
                    if (nextChar === '"') {
                        currentField += '"';
                        i++; // Skip the next quote
                    } else {
                        insideQuotes = false;
                    }
                } else {
                    insideQuotes = true;
                }
            } else if (char === ',' && !insideQuotes) {
                pushField();
            } else if (char === '\n' && !insideQuotes) {
                pushField();
                rows.push(currentRow);
                currentRow = [];
                continue; // Skip the newline character
            } else {
                currentField += char;
            }
        }

        pushField();
        rows.push(currentRow);

        return rows;
    }
}
