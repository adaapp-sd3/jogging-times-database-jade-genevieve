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

    // TODO: add some validation in here to check

    // hash the password - we dont want to store it directly
    const passwordHash = bcrypt.hashSync(form.password, saltRounds);

    // create the user
    const userId = User.insert(form.name, form.email, passwordHash);

    // set the userId as a cookie
    res.cookie('userId', userId);

    // redirect to the logged in page
    res.redirect('/times');
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

    // Done: get real stats from the database
    const totalDistance = userJogs.reduce((total, current) => total + current.distance, 0);

    const totalTime = userJogs.reduce((total, current) => total + current.duration, 0);

    const avgSpeed = totalDistance / totalTime;

    res.render('list-times.html', {
        user: loggedInUser,
        stats: {
            totalDistance: totalDistance.toFixed(2),
            totalTime: totalTime.toFixed(2),
            avgSpeed: avgSpeed.toFixed(2),
        },

        // Done: get the real jog times from the db
        times: userJogs,
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


/** edit time */

// show the edit time form for a specific time
routes.get('/times/:id', (req, res) => {
    const timeId = req.params.id;
    console.log('get time', timeId);

    // TODO: get the real time for this id from the db
    const jogTime = {
        id: timeId,
        startTime: formatDateForHTML('2018-11-4 15:17'),
        duration: 67.4,
        distance: 44.43,
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

    // TODO: edit the time in the db

    res.redirect('/times');
});

// handle deleteing the time
routes.get('/times/:id/delete', (req, res) => {
    const timeId = req.params.id;
    console.log('delete time', timeId);

    // TODO: delete the time

    res.redirect('/times');
});

module.exports = routes;
