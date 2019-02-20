// eslint-disable-next-line no-unused-vars
const { db, helpers } = require('../database');

class Following {
    static followUser(follower, followed) {
        // run the insert query
        helpers.insertRow(
            'INSERT INTO following (follower, followed) VALUES (?, ?)',
            [follower, followed],
        );
        return null;
    }

    static unfollowUser(follower, followed) {
        helpers.deleteRow(
            'DELETE FROM following WHERE follower = ? AND followed = ?',
            [follower, followed],
        );
        return null;
    }

    static findFollowing(follower, followed) {
        const row = helpers.getRow('SELECT follower, followed FROM following WHERE follower = ? AND followed = ?',
            [follower, followed]);

        if (row) {
            return new Following(row);
        }
        return null;
    }

    static findAllFollowers(id) {
        const row = helpers.getRows('SELECT user.name, user.id FROM user JOIN following ON following.follower = user.id WHERE followed = ?',
            [id]);

        if (row) {
            return row;
        }
        return null;
    }

    static countFollowers(id) {
        const totalFollowers = helpers.getRows('SELECT COUNT(*) AS count FROM following WHERE followed = ?',
            [id]);
        const countValue = totalFollowers[0].count;
        const count = countValue;
        return count;
    }

    static findAllFollowed(id) {
        const row = helpers.getRows('SELECT user.name, user.id FROM user JOIN following ON following.followed = user.id WHERE follower = ?',
            [id]);

        if (row) {
            return row;
        }
        return null;
    }

    static countFollowed(id) {
        const totalFollowed = helpers.getRows('SELECT COUNT(*) AS count FROM following WHERE follower = ?',
            [id]);
        const countValue = totalFollowed[0].count;
        const count = countValue;
        return count;
    }

    constructor(databaseRow) {
        this.followed = databaseRow.followed;
        this.follower = databaseRow.follower;
    }
}

module.exports = Following;
