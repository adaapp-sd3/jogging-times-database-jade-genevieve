// eslint-disable-next-line no-unused-vars
const { db, helpers } = require('../database');

class User {
    static insert(name, email, passwordHash) {
    // run the insert query
        const userId = helpers.insertRow(
            'INSERT INTO user (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, passwordHash],
        );
        return userId;
    }

    static findById(id) {
        const row = helpers.getRow('SELECT * FROM user WHERE id = ?', [id]);

        if (row) {
            return new User(row);
        }
        return null;
    }

    static findByEmail(email) {
        const row = helpers.getRow('SELECT * FROM user WHERE email = ?', [email]);

        if (row) {
            return new User(row);
        }
        return null;
    }

    constructor(databaseRow) {
        this.id = databaseRow.id;
        this.name = databaseRow.name;
        this.email = databaseRow.email;
        this.passwordHash = databaseRow.password_hash;
    }
}

module.exports = User;
