'use strict';

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var temp = './temp3'; // <-- name folder here
var count  = 1;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fileLocation = '/Users/peterbrennan/g5/jive-script-test/temp/119-Jive_JSON.txt';
var file = 'file://' + fileLocation;// provide file location

var app = express();
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json()); 

String.prototype.replaceBetween = function(start, end, what) {
    return this.substring(0, start) + what + this.substring(end);
};

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

function getIndicesMod(searchStr, str, start){
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var index, indices = [];
    for(var i = 0; i < start.length; i++){
        index = str.indexOf('style', start[i]);
        indices.push(index);
    }
    return indices;
}

//some pretty ugly hard coding going on with the indexing in the following functions. There shouldn't be any problems though
//gets urls that refference images from JSON output
function getImageUrls(hrefIndices, imgIndices, text){
    var urls = [];
    while(hrefIndices.length > 0){
        var url = text.substring(hrefIndices.shift()+9, imgIndices.shift()-4);
        urls.push(url);
        var subUrl = url.substring(url.indexOf)
    }
    return urls;
}


function getSrcUrls(srcIndices, otherIndices, text){
    var urls = [];
    var subUrls = [];
    while(srcIndices.length > 0){
        var url = text.substring(srcIndices.shift()-42, otherIndices.shift()-3);
        urls.push(url);;
        console.log("IMG URL", url);
    }
    return urls;
}


//formats JSON to be read as HTML (I hope)
function cvtToHTML(text){
    var index1 = text.indexOf('<body>');
    var index2 = text.indexOf('</body>') + 7;
    var final = text.substring(index1, index2);
    final = "<!DOCTYPE html><html><head></head>"+ final + "</html>"
    return final;
}

//checks to see if there is actually page contents in the JSON output. If not the output will not be saved.
function checkForContents(text){
    var index1 = text.indexOf('<div class=') + 37;
    var index2 = text.indexOf('</div><!-- [DocumentBodyEnd');
    if(text.substring(index1, index2).length > 0){
        return true;
    }else{
        return false;
    }
}

function replaceUrls(hrefIndices, imgIndices, text){
    var diff = 0;
    while(hrefIndices.length > 0){
        var index1 = hrefIndices.shift()+9 - diff;
        var index2 = imgIndices.shift()-4 - diff;
        var url = text.substring(index1, index2);
        var subUrl = url.substring(url.indexOf("/", url.indexOf("/")+ 50)); //I have no idea why this line works but it does
        subUrl = 'https://s3-us-west-2.amazonaws.com/peter-jive-dump/images' + subUrl;;
        text = text.replaceBetween(index1, index2, subUrl);
        diff = diff + (url.length - subUrl.length);
    }
    return text;
}

function replaceUrlSrc(srcIndices, otherIndices, text){
    var diff = 0;
    while(srcIndices.length > 0){
        var index1 = srcIndices.shift() - 7 - diff;
        var index2 = otherIndices.shift() -3 - diff;
        var url = text.substring(index1, index2);
        var subUrl = url.substring(url.indexOf("/", url.indexOf("downloadImage/")+ 20)); 
        subUrl = '"https://s3-us-west-2.amazonaws.com/peter-jive-dump/images' + subUrl + '"';
        text = text.replaceBetween(index1 - 37, index2+2, subUrl);
        diff = diff + (url.length - subUrl.length) + 39;

    }
    return text;
}

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

function getSubject(text){
    return (text.substring(text.indexOf('"subject"')+11, text.indexOf('viewCount')-3)).replaceAll("/", "-");
}

app.post('/contents', function(req, res) {

	if (!fs.existsSync(temp)){
	    fs.mkdirSync(temp);
	    console.log('Temporary folder created');
	}

    //makes a folder to store the individual JSON text along with a text file of urls found in the JSON
    var folderName = count + 'Jive_JSON';
    
    //strings to be written to files
    var payload = JSON.stringify(JSON.parse(req.body.payload));

    //creates file names based on the subject from the html
    var outputFileName = getSubject(payload) + ".json";
    var htmlOut = getSubject(payload) + ".html";
    console.log(htmlOut);

    //adds urls of images to a text file so that they can be curled and uploaded to s3
    var urls = getSrcUrls(getIndicesOf("downloadImage", payload), getIndicesMod("style", payload, getIndicesOf("downloadImage", payload)), payload);
    var urlStr = urls.toString();
    urlStr = urlStr + ',';
    payload = replaceUrlSrc(getIndicesOf("downloadImage", payload), getIndicesMod("style", payload, getIndicesOf("downloadImage", payload)), payload); //ew

    // send payload and url text files to folder
    //checks to see if there is content and logs whether or not the payload is saved

    if(checkForContents(payload) == true){
        count ++;
        fs.writeFileSync("temp3/" + htmlOut, cvtToHTML(payload), null, 4); // write to "temp" folder
        if(urls.length > 0){
            fs.appendFileSync('urls.txt', urlStr);
        }
        res.send('Saved to ' + outputFileName);
        console.log("has content");
    }else{
        console.log("no content");
        res.send('Did not save');
    }
    console.log("URL STR", urlStr);
});

var port = 3000; // <--local host port
app.listen(port);
console.log('Express started on port %d ...', port);




