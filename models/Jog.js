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

    static findJogById(id) {
        const row = helpers.getRow('SELECT * FROM jog WHERE id = ?', [id]);

        if (row) {
            return row;
        }
        return null;
    }

    static findJogByUser(userId) {
        const row = helpers.getRow('SELECT * FROM jog WHERE user_id = ?', [userId]);

        if (row) {
            return row.map(item => new Jog(item));
        }
        return null;
    }

    static findJogsByUser(userId) {
        const row = helpers.getRows('SELECT * FROM jog WHERE user_id = ?', [userId]);

        if (row) {
            return row.map(item => new Jog(item));
        }
        return null;
    }

    static findJogsByFollowers(userId) {
        const row = helpers.getRows('SELECT user.name, jog.start_time, jog.distance, jog.duration FROM jog JOIN user ON user.id = jog.user_id JOIN following ON following.follower = user.id WHERE following.followed = ? ORDER BY jog.start_time DESC', [userId]);
        if (row) {
            console.log(row);
            return row;
        }
        return null;
    }

    static findJogsByFollowed(userId) {
        const row = helpers.getRows('SELECT user.name, jog.start_time, jog.distance, jog.duration FROM jog JOIN user ON user.id = jog.user_id JOIN following ON following.followed = user.id WHERE following.follower = ? ORDER BY jog.start_time DESC', [userId]);
        if (row) {
            console.log(row);
            return row;
        }
        return null;
    }

    static getTotalJogCount(userId) {
        const totalJogs = helpers.getRows('SELECT COUNT(*) AS count FROM jog WHERE user_id = ?', [userId]);
        const countValue = totalJogs[0].count;
        const count = countValue;
        console.log(count);
        return count;
    }

    static updateJog(startTime, distance, duration, id) {
        const jogEdit = helpers.updateRow(
            'UPDATE jog SET start_time = ?, distance = ?, duration = ?  WHERE id = ?',
            [startTime, distance, duration, id],
        );
        return jogEdit;
    }

    // TODO
    // static findLongestDistance(idList) {
    //     if (row) {
    //         console.log(row);
    //         return row;
    //     }
    //     return null;
    // }

    // static findMostTime(idList) {
    //     if (row) {
    //         console.log(row);
    //         return row;
    //     }
    //     return null;
    // }

    // static findBestSpeed(idList) {
    //     if (row) {
    //         console.log(row);
    //         return row;
    //     }
    //     return null;
    // }

    static deleteJog(id) {
        helpers.deleteRow('DELETE FROM jog WHERE id = ?', [id]);
        return null;
    }

    constructor(databaseRow) {
        this.id = databaseRow.id;
        this.userId = databaseRow.user_id;
        this.startTime = databaseRow.start_time;
        this.distance = databaseRow.distance;
        this.duration = databaseRow.duration;
    }
}

module.exports = Jog;
