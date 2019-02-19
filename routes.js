const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Jog = require('./models/Jog');


const routes = new express.Router();

const saltRounds = 10;

function formatDateForHTML(date) {
    return new Date(date).toISOString().slice(0, -8);
}

/** main page */

routes.get('/', (req, res) => {
    if (req.cookies.userId) {
    // if we've got a user id, assume we're logged in and redirect to the app:
        res.redirect('/times');
    } else {
    // otherwise, redirect to login
        res.redirect('/sign-in');
    }
});


/** create account */

// show the create account page
routes.get('/create-account', (req, res) => {
    res.render('create-account.html');
});

// handle create account forms:
routes.post('/create-account', (req, res) => {
    const form = req.body;

    // TODO: add some validation in here to check >.<;;

    // hash the password - we dont want to store it directly
    const passwordHash = bcrypt.hashSync(form.password, saltRounds);

    // create the user
    const userId = User.insert(form.name, form.email, passwordHash);

    // set the userId as a cookie
    res.cookie('userId', userId);

    // redirect to the logged in page
    res.redirect('/times');
});

/** DONE: edit account */

// show the edit account form for a specific id
routes.get('/account/:id', (req, res) => {
    const accountId = req.cookies.userId;
    console.log('get account', accountId);

    // get the real account for this id from the db
    const thisAccount = User.findById(accountId);
    const accountDeets = {
        id: accountId,
        name: thisAccount.name,
        email: thisAccount.email,
    };

    res.render('edit-account.html', {
        user: accountDeets,
    });
});

// handle the edit account form
routes.post('/account/:id', (req, res) => {
    const accountId = req.cookies.userId;
    const form = req.body;

    console.log('edit account', {
        accountId,
        form,
    });

    // edit the account in the db
    User.updateUser(form.name, form.email, accountId);

    res.redirect('/times');
});

// handle deleting account
routes.get('/account/:id/delete', (req, res) => {
    const accountId = req.cookies.userId;
    console.log('delete user', accountId);

    // delete account and redirect
    User.deleteUser(accountId);

    res.redirect('/create-account');
});

/** sign in */

// show the sign-in page
routes.get('/sign-in', (req, res) => {
    res.render('sign-in.html');
});

routes.post('/sign-in', (req, res) => {
    const form = req.body;

    // find the user that's trying to log in
    const user = User.findByEmail(form.email);

    // if the user exists...
    if (user) {
        console.log({ form, user });
        if (bcrypt.compareSync(form.password, user.passwordHash)) {
            // the hashes match! set the log in cookie
            res.cookie('userId', user.id);
            // redirect to main app:
            res.redirect('/times');
        } else {
            // if the username and password don't match, say so
            res.render('sign-in.html', {
                errorMessage: 'Email address and password do not match',
            });
        }
    } else {
    // if the user doesnt exist, say so
        res.render('sign-in.html', {
            errorMessage: 'No user with that email exists',
        });
    }
});

// handle signing out
routes.get('/sign-out', (req, res) => {
    // clear the user id cookie
    res.clearCookie('userId');

    // redirect to the login screen
    res.redirect('/sign-in');
});


/** list times */

// list all times
routes.get('/times', (req, res) => {
    const loggedInUser = User.findById(req.cookies.userId);
    const userJogs = Jog.findJogsByUser(req.cookies.userId);
    const jogCount = Jog.getTotalJogCount(req.cookies.userId);
    // Done: get real stats from the database
    const totalDistance = userJogs.reduce((total, current) => total + current.distance, 0);

    const totalTime = userJogs.reduce((total, current) => total + current.duration, 0);

    const avgSpeed = ((totalDistance / totalTime) || 0); // Fix NaN showing with no data.

    res.render('list-times.html', {
        user: loggedInUser,
        stats: {
            totalDistance: totalDistance.toFixed(2),
            totalTime: totalTime.toFixed(2),
            avgSpeed: avgSpeed.toFixed(2),
            totalJogs: jogCount,
        },

        // Done: get the real jog times from the db
        times: userJogs.map(jog => ({
            ...jog,
            startTime: formatDateForHTML(jog.startTime).replace('T', ' '),
            avgSpeed: (jog.distance / jog.duration).toFixed(2),
        })),
    });
});


/** create time */

// show the create time form
routes.get('/times/new', (req, res) => {
    // this is hugely insecure. why?
    const loggedInUser = User.findById(req.cookies.userId);

    res.render('create-time.html', {
        user: loggedInUser,
    });
});

// handle the create time form
routes.post('/times/new', (req, res) => {
    const form = req.body;

    console.log('create time', form);

    // Done: save the new time
    Jog.insert(req.cookies.userId, form.startTime, form.distance, form.duration);


    res.redirect('/times');
});


/** EDIT TIME */

// show the edit time form for a specific time
routes.get('/times/:id', (req, res) => {
    const timeId = req.params.id;
    console.log('get time', timeId);

    // Done: get the real time for this id from the db
    const thisJog = Jog.findJogById(timeId);
    const jogTime = {
        id: timeId,
        startTime: formatDateForHTML(thisJog.start_time),
        duration: thisJog.duration,
        distance: thisJog.distance,
    };

    res.render('edit-time.html', {
        time: jogTime,
    });
});

// handle the edit time form
routes.post('/times/:id', (req, res) => {
    const timeId = req.params.id;
    const form = req.body;

    console.log('edit time', {
        timeId,
        form,
    });

    // DOne: edit the time in the db
    Jog.updateJog(form.startTime, form.distance, form.duration, timeId);

    res.redirect('/times');
});

// handle deleting the time
routes.get('/times/:id/delete', (req, res) => {
    const timeId = req.params.id;
    console.log('delete time', timeId);

    // Done: delete the time
    Jog.deleteJog(timeId);

    res.redirect('/times');
});

/** TIMELINE */

// show the timeline page
routes.get('/timeline', (req, res) => {
    const loggedInUser = User.findById(req.cookies.userId);

    res.render('timeline.html', {
        user: loggedInUser,
    });
});

/** search users */
routes.post('/timeline', (req, res) => {
    const form = req.body;

    // find the user searched for
    const searchedUser = User.findByName(form.searchName);

    // if the searchedUser exists...
    if (searchedUser) {
        console.log({ form, searchedUser });
        console.log(searchedUser.id);
        // reload page:
        res.render('timeline.html', {
            results: searchedUser.map(user => ({
                ...user,
                jogs: Jog.getTotalJogCount(user.id),
            })),
        });
    } else {
        // if the user doesn't exist
        res.render('timeline.html', {
            errorMessage: 'User doesn\'t exist',
        });
    }
});


// list searched users
routes.get('/timeline', (req, res) => {
    const loggedInUser = User.findById(req.cookies.userId);
    const form = req.body;
    const searchedUser = User.findByName(form.name);

    res.render('timeline.html', {
        loggedInUser,
        result: searchedUser.name,

    });
});

// view user page

routes.get('/user-page/:id', (req, res) => {
    const loggedInUser = User.findById(req.cookies.userId);
    const account = User.findById(req.params.id);
    const userJogs = Jog.findJogsByUser(req.params.id);
    const jogCount = Jog.getTotalJogCount(req.params.id);
    // get real stats from the database
    const totalDistance = userJogs.reduce((total, current) => total + current.distance, 0);

    const totalTime = userJogs.reduce((total, current) => total + current.duration, 0);

    const avgSpeed = ((totalDistance / totalTime) || 0); // Fix NaN showing with no data.


    res.render('user-page.html', {
        loggedInUser,
        user: account,
        stats: {
            totalDistance: totalDistance.toFixed(2),
            totalTime: totalTime.toFixed(2),
            avgSpeed: avgSpeed.toFixed(2),
            totalJogs: jogCount,
        },

        // get the real jog times from the db
        times: userJogs.map(jog => ({
            ...jog,
            startTime: formatDateForHTML(jog.startTime).replace('T', ' '),
            avgSpeed: (jog.distance / jog.duration).toFixed(2),
        })),
    });
});

/** LEADERBOARD */

// show the leaderboard page
routes.get('/leaderboard', (req, res) => {
    const loggedInUser = User.findById(req.cookies.userId);

    res.render('leaderboard.html', {
        loggedInUser,
    });
});

module.exports = routes;
