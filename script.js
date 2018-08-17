'use strict';

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var temp = './temp'; // <-- name folder here
var count  = 1;

var app = express();
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json()); 


app.post('/contents', function(req, res) {

	if (!fs.existsSync(temp)){
	    fs.mkdirSync(temp);
	    console.log('Temporary folder created')
	}

    var outputFilename = count + '-Jive_JSON.json'; // creates random file name (may want to add non-random file naming)
    count ++;

    var payload = JSON.stringify(JSON.parse(req.body.payload));

    fs.writeFileSync("temp/" + outputFilename, payload, null, 4); // write to "temp" folder

    res.send('Saved to ' + outputFilename);

});

var port = 3000; // <--local host port
app.listen(port);
console.log('Express started on port %d ...', port);




