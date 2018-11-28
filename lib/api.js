let express = require('express');
let app = express();
const { Pool, Client } = require('pg')

const pool = new Pool({
    user: "vltmughdlkmhkn",
    host: "ec2-107-21-93-132.compute-1.amazonaws.com",
    database: "d1t10mqae3snpd",
    password: "7aa532fb511f5a73ea4746d6a80fb0229da639ec616fe8bac365ce3fe3711f0c",
    port: "5432",
    ssl: true
});

app.use(express.static('public'));
app.use('/public', express.static('public'));

module.exports = function (app) {

    // Handling invalid use of API
    app.get('/api', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });
    app.get('/api/user', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });
    app.get('/api/company', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/transaction', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/transaction/company', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/transaction/user', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/buy', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/buy/user', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/buy/company', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/sell', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/sell/user', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    app.get('/api/sell/company', (req, res) => {
        res.json({
            "HTTP Status": 200,
            "Message": "Provide headers"
        });
    });

    // If user wants to see list of accounts from the database...
    app.get('/api/accounts', (req, res) => {
        let query = `SELECT usrname AS Username, pssword AS Password FROM stockholder `;
        getData(query, res);
    });

    // Performing SQL Queries...
    app.get('/api/user/:id', (req, res) => {
        let query = `SELECT stkh_id, stkh_name, stkh__addr, stkh_phn, stocks_bought, stocks_sold FROM stockholder WHERE stkh_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/company/comp_ticker', (req, res) => {
        let query = `SELECT company.comp_id, company.comp_ticker FROM company`;
        getData(query, res);
    });

    app.get('/api/company/:id', (req, res) => {
        let query = `SELECT * FROM company WHERE comp_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/transaction/:id', (req, res) => {
        let query = `SELECT * FROM transactions WHERE trsc_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/transaction/company/:id', (req, res) => {
        let query = `SELECT * FROM transactions WHERE compid=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/transaction/user/:id', (req, res) => {
        let query = `SELECT * FROM transactions WHERE stkh_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/buy/:id', (req, res) => {
        let query = `SELECT * FROM buying WHERE buying_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/buy/user/:id', (req, res) => {
        let query = `SELECT * FROM buying WHERE buyer_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/buy/company/:id', (req, res) => {
        let query = `SELECT * FROM buying WHERE comp_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/sell/:id', (req, res) => {
        let query = `SELECT * FROM buying WHERE selling_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/sell/user/:id', (req, res) => {
        let query = `SELECT * FROM selling WHERE seller_id=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/sell/company/:id', (req, res) => {
        let query = `SELECT * FROM selling WHERE compid=${req.params.id}`;
        getData(query, res);
    });

    app.get('/api/view7', (req, res) => {
        let query = 'SELECT comp_name, AVG(total_price) AS avbought, AVG(CASE WHEN trsc_type=\'sell\' THEN total_price ELSE 0 END) AS avsold FROM company, transactions WHERE comp_id=compid GROUP BY comp_name';
        getData(query, res);
    });
    app.get('/api/view8', (req, res) => {
        let query = 'SELECT s.stkh_name, c.comp_Name, se.quantity as fsale, t.quantity as sold FROM stockholder s, company c, selling se, transactions t WHERE se.selling_id = t.sell_id and t.compID = c.comp_id and t.stkh_ID = s.stkh_id';
        getData(query, res);
    });
}

async function getData(query, res) {
    const client = await pool.connect();
    await client.query('BEGIN');
    await JSON.stringify(client.query(query, (err, result) => {
        if (err) {
            res.json({
                "Response": "Error fetching data.",
                "Error": err
            });
            console.log(err);
        } else {
            if (result.rows.length > 0) {
                res.send(result.rows);
            } else {
                res.json({ "Response": "No data found." });
                console.log("No data found...");
            }
        }
    }));
}