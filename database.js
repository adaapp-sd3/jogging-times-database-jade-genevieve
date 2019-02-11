const fs = require('fs');
const SQL = require('sql.js');

// open a database
let databaseFileBuffer = fs.readFileSync('./database.sqlite');
const db = new SQL.Database(databaseFileBuffer);

// sql.js won't save the database file. this is a hack to overwrite it every second.
// if it's changed. in a normal database system this isn't needed.
setInterval(() => {
    const bytes = db.export();
    const newDatabaseFileBuffer = Buffer.from(bytes);
    if (!newDatabaseFileBuffer.equals(databaseFileBuffer)) {
        console.log(
            `Saving database (${(newDatabaseFileBuffer.length / 1024).toFixed(1)}kb)`,
        );
        fs.writeFileSync('./database.sqlite', newDatabaseFileBuffer);
        databaseFileBuffer = newDatabaseFileBuffer;
    }
}, 500);

const helpers = {
    // run a query returning any number of rows
    getRows(sqlString, bindings) {
        const statement = db.prepare(sqlString);
        const rows = [];
        statement.bind(bindings);
        while (statement.step()) {
            rows.push(statement.getAsObject());
        }
        statement.free();
        return rows;
    },
    // run a query returning a single row, or null if no rows returned
    getRow(sqlString, bindings) {
        const rows = helpers.getRows(sqlString, bindings);
        if (rows.length === 0) {
            return null;
        }
        if (rows.length !== 1) {
            throw new Error(
                `Expected getRow to return a single row, got ${rows.length}`,
            );
        }
        return rows[0];
    },
    // run a query that shouldn't return any rows
    runAndExpectNoRows(sqlString, bindings) {
        const rows = helpers.getRows(sqlString, bindings);
        if (rows.length !== 0) {
            throw new Error(`Expected no rows, but got ${rows.length}`);
        }
    },
    // insert a row and return its id
    insertRow(sqlString, bindings) {
        helpers.runAndExpectNoRows(sqlString, bindings);
        return helpers.getRow('select last_insert_rowid() as id').id;
    },

    // update a row
    updateRow(sqlString, bindings) {
        helpers.runAndExpectNoRows(sqlString, bindings);
        if (!bindings) {
            throw new Error('Could not find row');
        }
        return helpers.getRow('select last_insert_rowid() as id').id;
    },
};

// export the database so we can use it elsewhere
module.exports = {
    db,
    helpers,
};
