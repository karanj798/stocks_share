const express = require('express');
const app = express();
const router = express.Router();
const request = require('request');

const API_KEY = '1PSIMRWFEEXU4CK2';

// API of https://www.alphavantage.co
// function => type of time interval
// symbol => is the company symbol, referred to as a ticker
// interval => how long the time interval
// api key 
module.exports = function (router) {
    router.post('/api/stocks/:company_ticker/:function', function (req, res, next) {
        var URL_api = `https://www.alphavantage.co/query?function=${req.params.function}&symbol=${req.params.company_ticker}&apikey=${API_KEY}`;

        request(URL_api, function (error, response, body) {
            //console.log('error:', error); // Print the error if one occurred
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body);
            
            if (error) {
                console.log('error:', error); // Print the error if one occurred
            } else {
                var content = JSON.parse(body);

                var today = new Date();
                var dd = today.getDate();
                if (dd < 10) {
                    dd = '0' + dd
                }

                res.send({
                    success: true,
                    message: 'Its Good',
                    stockInfo: content['Time Series (Daily)'][String(today.getFullYear() + '-' + today.getMonth() + '-' + dd)]
                });
            }
            
            
        });
        
    });

    router.post('/api/stocks/:company_ticker/:function/:interval', function (req, res, next) {
        var URL_api = `https://www.alphavantage.co/query?function=${req.params.function}&symbol=${req.params.company_ticker}&interval=${req.params.interval}&apikey=${API_KEY}`;

        request(URL_api, function (error, response, body) {
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body);

            if (error) {
                console.log('error:', error); // Print the error if one occurred
            }else{
                var content = JSON.parse(body);
                var firstProp;
                for (var key in content) {
                    if (content.hasOwnProperty(key)) {
                        firstProp = content[key];
                        //break;
                    }
                }

                var stockCurrPrice;
                for (var key in firstProp) {
                    if (firstProp.hasOwnProperty(key)) {
                        stockCurrPrice = firstProp[key];
                        break;
                    }
                }


                /*  var today = new Date();
                 var mm = today.getMonth() + 1;
                 var dd = today.getDate();
                 if (dd < 10) {
                     dd = '0' + dd
                 }
                 h = (today.getHours() < 10 ? '0' : '') + today.getHours();
                 m = (today.getMinutes() < 10 ? '0' : '') + (today.getMinutes() - 3);
                 var time = h + ':' + m + ':00';
                 console.log(String(today.getFullYear() + '-' + mm  + '-' + dd + ' ' + time)); */

                res.send({
                    success: true,
                    message: 'Its Good',
                    ticker: content['Meta Data']['2. Symbol'],
                    stockInfo: stockCurrPrice
                });
            }
            
        });
    });
};


var apiDup = (functions, ticker) => {
     var URL_api = `https://www.alphavantage.co/query?function=${functions}&symbol=${ticker}&apikey=${API_KEY}`;

     request(URL_api, function (error, response, body) {
         console.log('error:', error); // Print the error if one occurred
         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
         //console.log('body:', body);
         var content = JSON.parse(body);
         //console.log(content['Time Series (Daily)']);

         res.send({
             success: true,
             message: 'Its Good',
             stockInfo: content['Time Series (Daily)']['2018-11-21']['1. open']
         });
     });
};

