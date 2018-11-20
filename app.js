const express = require('express');
const hbs = require('hbs');
const flash = require('connect-flash');
const passport = require("passport");
const request = require('request');
const session = require("express-session");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const expressSession = require('express-session');
const PORT = process.env.PORT || 3000



app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(session({secret: 'keyboard cat'}))
app.use(bodyParser());

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');
app.set('view options', { layout: false });

require('./lib/routes.js')(app);


app.listen(PORT, 'localhost', (err) => {
    if (err) {
        console.log(err);
    }
    console.info('>>> 🌎 Open http://localhost:%s/ in your browser.', PORT);
});