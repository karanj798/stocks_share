var dbInfo = {
    "host": "ec2-107-21-93-132.compute-1.amazonaws.com",
    "dbName": "d1t10mqae3snpd",
    "port": 5432,
    "user": "vltmughdlkmhkn",
    "pass": "7aa532fb511f5a73ea4746d6a80fb0229da639ec616fe8bac365ce3fe3711f0c"
};
var uri = `postgres://${dbInfo.user}:${dbInfo.pass}@${dbInfo.host}:${dbInfo.port}/${dbInfo.dbName}`;

const express = require('express');
const hbs = require('hbs');
var app = express();

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
	res.render('home.hbs');
});

app.get('/bad', (req, res) => {
	res.send({
		errorMessage: 'Hey silly goose, you encountered an ERROR!'	
		});
});

app.get('/api', (req, res) => {
	res.send({
		status: 200,
		message: 'Please provide some parameters'
	})
})

app.listen(3000); // Port to listen incoming connections on ...
 
