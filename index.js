var express = require('express');
var bodyparser = require('body-parser');
var util = require('util');
var simulator = require('./src/simulator');

var app = express();

var port = process.env.PORT || 8080;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyparser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyparser.json());

/**
 * accept an object type sprintPlanning @see api definition sprintPlanning
 */
app.post('/api/1/simulation',(req,res) =>{
	
	var body = req.body;
	
	var result = simulator.runSimulation(body);

	res.json(result);
});

/**
 * accept an object type sprintPlanning @see api definition sprintPlanning
 */
app.post('/api/1/simulation/montecarlo',(req,res) =>{
	var body = req.body;
	
	var result = simulator.runMontecarlo(body);

	res.json(result);
});

/**
 * accept an array of type card @see api definition card
 * @param {string} capacity the sprint capacity
 */
app.post('/api/1/simulation/kp01',(req,res) =>{
	var body = req.body;
	var weightMap = req.query.weight;
	var valueMap = req.query.value;

	var capacity = req.query.capacity;

	var map = null;
	if (weightMap && valueMap) {
		map = {value : valueMap, weight : weightMap};
	}
	
	var result = simulator.runKnapsack(body, capacity, {map  : map});

	res.json(result);
});


app.listen(port, function () {
  console.log('Listening on port:', port);
});
