// eslint-disable-next-line no-unused-vars
const { db, helpers } = require('../database');

class Jog {
    static insert(userId, startTime, distance, duration) {
    // run the insert query
        const jogId = helpers.insertRow(
            'INSERT INTO jog (user_id, start_time, distance, duration) VALUES (?, ?, ?, ?)',
            [userId, startTime, distance, duration],
        );
        return jogId;
    }

    static findJogsByUserId(userId) {
        const row = helpers.getRow('SELECT * FROM user WHERE id = ?', [userId]);

        if (row) {
            return new Jog(row);
        }
        return null;
    }

    // static someJogFinderThing(email) {
    //     const row = helpers.getRow('SELECT * FROM user WHERE email = ?', [email]);

    //     if (row) {
    //         return new Jog(row);
    //     }
    //     return null;
    // }

    constructor(databaseRow) {
        this.id = databaseRow.id;
        this.userId = databaseRow.user_id;
        this.startTime = databaseRow.start_time;
        this.distance = databaseRow.distance;
        this.duration = databaseRow.duration;
    }
}

module.exports = Jog;
