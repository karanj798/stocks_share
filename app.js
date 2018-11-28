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
app.use(expressSession({ secret: 'mySecretKey' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(session({ secret: 'keyboard cat' }))
app.use(bodyParser());

//hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper("if_eq", function (a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

hbs.registerHelper('times', function (n, block) {
    var accum = '';
    for (var i = 0; i <= n; ++i)
        accum += block.fn(i);
    return accum;
});

hbs.registerHelper('times', function (n, block) {
    var accum = '';
    for (var i = 0; i <= n; ++i)
        accum += block.fn(i);
    return accum;
});

app.set('view engine', 'hbs');
app.set('view options', { layout: false });

require('./lib/routes.js')(app);

app.use('/public', express.static('public'));

app.use('/api/stocks/ANF/TIME_SERIES_DAILY', function (req, res, next) {
    console.log('Request Type:', req.method);
    next();
})

app.listen(process.env.PORT || 3000, function () {
    console.info('>>> 🌎 Open http://localhost:%s/ in your browser.', this.address().port);
});

