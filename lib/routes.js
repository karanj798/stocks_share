const util = require('util');
const express = require('express');
const app = express();
const passport = require("passport");
const fs = require('fs');
const request = require('request');
const {
    Pool,
    Client
} = require('pg');
const uuidv4 = require('uuid/v4');
app.use(express.static('public'));

const LocalStrategy = require('passport-local').Strategy;
const currentAccountsData = [];
const path = require('path');
const url = require("url");
const pgp = require('pg-promise')();
var currUrl;
var currData;

const pool = new Pool({
    user: "vltmughdlkmhkn",
    host: "ec2-107-21-93-132.compute-1.amazonaws.com",
    database: "d1t10mqae3snpd",
    password: "7aa532fb511f5a73ea4746d6a80fb0229da639ec616fe8bac365ce3fe3711f0c",
    port: "5432",
    ssl: true
});

const db = pgp({
    host: 'ec2-107-21-93-132.compute-1.amazonaws.com',
    port: 5432,
    database: 'd1t10mqae3snpd',
    user: 'vltmughdlkmhkn',
    password: '7aa532fb511f5a73ea4746d6a80fb0229da639ec616fe8bac365ce3fe3711f0c'
});
app.use('/public', express.static('public'));

module.exports = function (app) {

    app.get('/', (req, res, next) => {
        if (req.isAuthenticated()) {
            /*res.render('account', {
                title: "Home",
                userData: req.user,
                dashBoardActive: "active",
                messages: {
                    danger: req.flash('danger'),
                    warning: req.flash('warning'),
                    success: req.flash('success')
                }
            });*/
            res.redirect('/account');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/account', (req, res, next) => {
        currUrl = req.get('host');

        if (req.isAuthenticated()) {
            //updateStockPrice(3);
            let query = 'SELECT s.selling_id, c.comp_ticker, c.comp_name, st.stkh_name, s.quantity FROM company as c, stockholder AS st, selling AS s WHERE c.comp_id = s.compid AND st.stkh_id = s.seller_id';
            let viewName = 'account.hbs';
            getData(query, req, res, viewName);

        } else {
            res.redirect('/login');
        }
    });

    app.get('/login', (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect('/account');
        } else {
            res.render('login', {
                title: "Log in",
                userData: req.user,
                error: req.flash('danger')
            });
        }

    });

    app.get('/transactions', (req, res) => {
        if (req.isAuthenticated()) {
            let query = 'SELECT trsc_type, trsc_date, company.comp_Name, quantity, total_price FROM transactions, company WHERE company.comp_id = transactions.compID AND stkh_ID =' + req.user[0].uid
            let viewName = 'transactions.hbs';
            getData(query, req, res, viewName);

        } else {
            res.redirect('/');
        }
    });

    app.get('/userhistory', (req, res) => {
        if (req.isAuthenticated()) {
            let query = 'SELECT stkh_name, balance, trsc_type, quantity, total_price, comp_name, ctype FROM ((stockholder JOIN transactions ON stockholder.stkh_id=transactions.stkh_ID) JOIN company ON transactions.compID = company.comp_id)';
            let viewName = 'history.hbs';
            getData(query, req, res, viewName);

        } else {
            res.redirect('/');
        }
    });

    app.get('/stats', (req, res) => {
        if (req.isAuthenticated()) {
            let query1 = 'SELECT comp_name, AVG(total_price) AS avbought, AVG(CASE WHEN trsc_type=\'sell\' THEN total_price ELSE 0 END) AS avsold FROM company, transactions WHERE comp_id=compid GROUP BY comp_name';

            let viewName = 'stats.hbs';

            request.get({
                url: `http://${currUrl}/api/testing`
            }, (err, ress, bodyy) => {
                if (err) {
                    console.log(err);
                } else {
                    var content = JSON.parse(bodyy);

                    getMultipleData(req, res, query1, content);
                }
            });

        } else {
            res.redirect('/');
        }
    })

    app.get('/logout', (req, res) => {

        console.log(req.isAuthenticated());
        req.logout();
        console.log(req.isAuthenticated());
        req.flash('success', "Logged out. See you soon!");
        res.redirect('/');
    });

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/account',
        failureRedirect: '/login',
        failureFlash: true
    }), function (req, res) {
        if (req.body.remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        } else {
            req.session.cookie.expires = false; // Cookie expires at end of session
        }
        res.redirect('/');
    });

    // Call api.js
    require('./api.js')(app);
    // Call stocks.js
    require('./api/stocks.js')(app);
}

passport.use('local', new LocalStrategy({
    passReqToCallback: true
}, (req, username, password, done) => {

    loginAttempt();

    async function loginAttempt() {

        const client = await pool.connect();
        try {
            await client.query('BEGIN')
            let currentAccountsData = await JSON.stringify(client.query('SELECT stkh_name, usrname, pssword, stkh_id FROM stockholder WHERE usrname=$1', [username], function (err, result) {

                if (err) {
                    return done(err)
                }
                if (result.rows[0] == null) {
                    req.flash('danger', "Oops. Incorrect log in details.");
                    return done(null, false);
                } else {
                    if (password == result.rows[0].pssword) {
                        return done(null, [{
                            name: result.rows[0].stkh_name,
                            uid: result.rows[0].stkh_id
                        }]);
                    } else {
                        console.log(password);
                        console.log(result.rows[0].pssword);
                        console.log('Error while checking password');
                        req.flash('danger', "Oops. Incorrect login details.");
                        return done();
                    }
                }
            }))
        } catch (e) {
            throw (e);
        }
    };

}));


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

async function getDataFromDB(query, req, res, viewName) {
    return new Promise(function (resolve, reject) {
        pool.query('BEGIN');
        JSON.stringify(pool.query(query, (err, result) => {
            if (err) {
                res.json({
                    "Response": "Error fetching data.",
                    "Error": err
                });
                console.log(err);
                reject();
            } else {
                if (result.rows.length > 0) {
                    res.render(viewName, {
                        usrname: req.user[0].name,
                        dashBoardActive: "active",
                        currentTime: new Date().toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            hour12: true,
                            minute: 'numeric'
                        }),
                        data: result.rows
                    });

                } else {
                    res.json({ "Response": "No data found." });
                    console.log("No data found...");
                }
                resolve();
            }
        }));
    });
}

async function getData(query, req, res, viewName) {
    await getDataFromDB(query, req, res, viewName);
}


function getMultipleDataFromDB(req, res, query1, content) {

    return new Promise(function (resolve, reject) {
        pool.query('BEGIN');
        JSON.stringify(pool.query(query1, (err, result) => {
            if (err) {
                res.json({
                    "Response": "Error fetching data.",
                    "Error": err
                });
                console.log(err);
                reject();
            } else {
                if (result.rows.length > 0) {
                    res.render('stats.hbs', {
                        usrname: req.user[0].name,
                        dashBoardActive: "active",
                        currentTime: new Date().toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            hour12: true,
                            minute: 'numeric'
                        }),

                        data3: content,
                        data: result.rows
                    });
                } else {
                    res.json({
                        "Response": "No data found."
                    });
                    console.log("No data found...");
                }
                resolve();
            }
        }));

    });
}

async function getMultipleData(req, res, query1, content) {
    await getMultipleDataFromDB(req, res, query1, content);
}



/*app.get('/join', function (req, res, next) {
    res.render('join', {title: "Join", userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
});
 
 
app.post('/join', async function (req, res) {
 
    try{
        const client = await pool.connect()
        await client.query('BEGIN')
        const pwd = await bcrypt.hash(req.body.password, 5);
        await JSON.stringify(client.query('SELECT id FROM "users" WHERE "email"=$1', [req.body.username], function(err, result) {
            if(result.rows[0]){
                req.flash('warning', "This email address is already registered. <a href='/login'>Log in!</a>");
                res.redirect('/join');
            }
            else{
                client.query('INSERT INTO users (id, "firstName", "lastName", email, password) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), req.body.firstName, req.body.lastName, req.body.username, pwd], function(err, result) {
                    if(err){console.log(err);}
                    else {
 
                    client.query('COMMIT')
                        console.log(result)
                        req.flash('success','User created.')
                        res.redirect('/login');
                        return;
                    }
                });
 
 
            }
 
        }));
        client.release();
    }
    catch(e){throw(e)}
});*/


function updateStockPrice() {
    var comp_query;
    var ticker;
    //console.log(window.location.href);

    //http://localhost:3000/api/company/comp_ticker
    request.get({
        url: `http://${currUrl}/api/company/comp_ticker`
    }, (error, ress, body_call) => {
        if (error) {
            return console.log(error);
        } else {
            comp_query = JSON.parse(body_call);

            for (var i = 0; i < comp_query.length; i++) {
                if (comp_query[i]['comp_ticker'] != null) {
                    ticker = comp_query[i]['comp_ticker'];

                    request.post({
                        url: `http://${currUrl}/api/stocks/${comp_query[i]['comp_ticker']}/TIME_SERIES_INTRADAY/1min`
                    }, (err, res, bodyy) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(bodyy);
                            var content = JSON.parse(bodyy);

                            if (content['stockInfo']) {
                                let queryWrite = `UPDATE company SET stk_price = ${parseFloat(content['stockInfo']['4. close'])} WHERE comp_ticker = '${String(content['ticker']).toUpperCase()}'`;
                                updateCurStockOnDB(queryWrite);
                            }
                        }
                    });
                }
            }
        }
    });
};

function queryDB(query) {
    return new Promise(function (resolve, reject) {
        pool.query(query, (err, result) => {
            if (err) {
                console.log(err);
                reject();
            } else {
                console.log('Query submitted');
                resolve();
            }
        });

    });
}

async function updateCurStockOnDB(query) {
    var x = await queryDB(query);
    console.log(x);
}
