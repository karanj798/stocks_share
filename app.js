var express = require('express');

const PORT = 3000

var flash = require('connect-flash');

var passport = require("passport");
var request = require('request');

var session = require("express-session");

var app = express();

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));

const expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

var bodyParser = require('body-parser')

var path = require('path');

//app.use('/public', express.static(__dirname + '/public'));

app.use(flash());
app.use(session({secret: 'keyboard cat'}))
app.use(bodyParser());
app.set('view engine', 'hbs');
app.set('view options', { layout: false });


require('./lib/routes.js')(app);

app.listen(PORT);