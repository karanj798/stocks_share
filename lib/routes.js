var util = require('util');
var express = require('express');
var app = express();
var passport = require("passport");

var fs = require('fs');
var request = require('request');
const { Pool, Client } = require('pg')
const uuidv4 = require('uuid/v4');

app.use(express.static('public'));

const LocalStrategy = require('passport-local').Strategy;
//const connectionString = process.env.DATABASE_URL;

var currentAccountsData = [];

const pool = new Pool({
	user: "vltmughdlkmhkn",
	host: "ec2-107-21-93-132.compute-1.amazonaws.com",
	database: "d1t10mqae3snpd",
	password: "7aa532fb511f5a73ea4746d6a80fb0229da639ec616fe8bac365ce3fe3711f0c",
	port: "5432",
	ssl: true
});

module.exports = function (app) {

	app.get('/', function (req, res, next) {
		if (req.isAuthenticated()){
			res.render('index', {title: "Home", userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		}else{
			res.redirect('/login');
		}
	});

	app.get('/account', function (req, res, next) {
		if(req.isAuthenticated()){
			res.render('account', {
				usrname: req.user[0].name
			})
		}
		else{
			res.redirect('/login');
		}
	});

	app.get('/login', function (req, res, next) {
		if (req.isAuthenticated()) {
			res.redirect('/account');
		}
		else{
			res.render('login', {title: "Log in", userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
		}

	});

	app.get('/logout', function(req, res){

		console.log(req.isAuthenticated());
		req.logout();
		console.log(req.isAuthenticated());
		req.flash('success', "Logged out. See you soon!");
		res.redirect('/');
	});

	app.post('/login',	passport.authenticate('local', {
		successRedirect: '/account',
		failureRedirect: '/login',
		failureFlash: true
		}), function(req, res) {
		if (req.body.remember) {
			req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
			} else {
			req.session.cookie.expires = false; // Cookie expires at end of session
		}
		res.redirect('/');
	});



}

passport.use('local', new  LocalStrategy({passReqToCallback : true}, (req, username, password, done) => {

	loginAttempt();
	async function loginAttempt() {

		const client = await pool.connect()
		try{
			await client.query('BEGIN')
			var currentAccountsData = await JSON.stringify(client.query('SELECT "stkh_name", "usrname", "pssword" FROM "stockholder" WHERE "usrname"=$1', [username], function(err, result) {

				if(err) {
					return done(err)
				}
				if(result.rows[0] == null){
					req.flash('danger', "Oops. Incorrect logsddin details.");
					return done(null, false);
				}
				else{
					if (password == result.rows[0].pssword){
						return done(null, [{name: result.rows[0].stkh_name}]);
					}else{
						console.log(password);
						console.log(result.rows[0].pssword);
						console.log('Error while checking password');
						req.flash('danger', "Oops. Incorrect login details.");
						return done();
					}
				}
			}))
		}

		catch(e){throw (e);}
	};

}
))


passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});



/*app.get('/join', function (req, res, next) {
	res.render('join', {title: "Join", userData: req.user, messages: {danger: req.flash('danger'), warning: req.flash('warning'), success: req.flash('success')}});
});


app.post('/join', async function (req, res) {

	try{
		const client = await pool.connect()
		await client.query('BEGIN')
		var pwd = await bcrypt.hash(req.body.password, 5);
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