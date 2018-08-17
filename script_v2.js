'use strict';

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var temp = './temp2'; // <-- name folder here
var count  = 1;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fileLocation = '/Users/peterbrennan/g5/jive-script-test/temp/119-Jive_JSON.txt';
var file = 'file://' + fileLocation;// provide file location

var app = express();
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json()); 

//functions to get image urls from JSON
function getIndicesOf(searchStr, str) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function getImageUrls(hrefIndices, imgIndices, text){
    var urls = [];
    while(hrefIndices.length > 0){
        urls.push(text.substring(hrefIndices.shift()+9, imgIndices.shift()-4));
    }
    return urls;
}

function cvtToHTML(text){
    var index1 = text.indexOf('<body>');
    var index2 = text.indexOf('</body>') + 7;
    var final = text.substring(index1, index2);
    return final;
}

function checkForContents(text){
    var index1 = text.indexOf('<div class=') + 37;
    var index2 = text.indexOf('</div><!-- [DocumentBodyEnd');
    if(text.substring(index1, index2).length > 0){
        return true;
    }else{
        return false;
    }
}

app.post('/contents', function(req, res) {

	if (!fs.existsSync(temp)){
	    fs.mkdirSync(temp);
	    console.log('Temporary folder created');
	}

	//creates file names numbered by the order which they were retrieved
    var outputFileName = count + '-JSON.json', htmlOut = count + '-HTML.html', urlFileName = count + '-IMG_URLs.txt';

    //makes a folder to store the individual JSON text along with a text file of urls found in the JSON
    var folderName = count + 'Jive_JSON';
    

    //strings to be written to files
    var payload = JSON.stringify(JSON.parse(req.body.payload));
    var urls = getImageUrls(getIndicesOf("a href", payload), getIndicesOf("img", payload), payload);
    var urlStr = urls.toString();

    // send payload and url text files to folder
    if(checkForContents(payload) == true){
        count ++;
        fs.mkdirSync('temp2/' + folderName);
        fs.writeFileSync("temp2/" + folderName + "/" + outputFileName, payload, null, 4); // write to "temp" folder
        fs.writeFileSync("temp2/" + folderName + "/" + htmlOut, cvtToHTML(payload), null, 4); // write to "temp" folder
        if(urls.length > 0){
            fs.writeFileSync("temp2/" + folderName + "/" + urlFileName, urlStr, null, 4);
        }
        res.send('Saved to ' + outputFileName);
        console.log("has content");
    }else{
        console.log("no content");
        res.send('Did not save');
    }


});

var port = 3000; // <--local host port
app.listen(port);
console.log('Express started on port %d ...', port);




