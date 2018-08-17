var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fileLocation = '/Users/peterbrennan/g5/jive-script-test/temp/7-Jive_JSON.json';
var file = 'file://' + fileLocation;// provide file location

String.prototype.replaceBetween = function(start, end, what) {
    return this.substring(0, start) + what + this.substring(end);
};

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    var returnString = "";
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                //console.log(allText);
                returnString = allText;
            }
        }
    }
    rawFile.send(null);
    return returnString;
}
var text = readTextFile(file);

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

var hrefIndices = getIndicesOf("a href", text);
var imgIndices = getIndicesOf("img", text);
var srcIndices = getIndicesOf('downloadImage', text);
var otherIndices = getIndicesMod("style", text, srcIndices);


function getImageUrls(hrefIndices, imgIndices, text){
    var urls = [];
    var subUrls = [];
    while(hrefIndices.length > 0){
        var url = text.substring(hrefIndices.shift()+9, imgIndices.shift()-4);
        urls.push(url);
        var subUrl = url.substring(url.indexOf("/", url.indexOf("/")+ 50)); //I have no idea why this line works but it does
        subUrl = "https://s3-us-west-2.amazonaws.com/peter-jive-dump/images" + subUrl;
        //text = text.replaceBetween(hrefIndices.shift()+9, imgIndices.shift()-4, subUrl);
        //console.log(text.replaceBetween(1, 10, "fuck everything"));
        subUrls.push(subUrl);
    }
    return urls;
}

function getSrcUrls(srcIndices, otherIndices, text){
    var urls = [];
    var subUrls = [];
    while(srcIndices.length > 0){
        var url = text.substring(srcIndices.shift()-42, otherIndices.shift()-3);
        urls.push(url);
        var subUrl = url.substring(url.indexOf("/", url.indexOf("/")+ 50)); //I have no idea why this line works but it does
        subUrl = "https://s3-us-west-2.amazonaws.com/peter-jive-dump/images" + subUrl;
        //text = text.replaceBetween(hrefIndices.shift()+9, imgIndices.shift()-4, subUrl);
        //console.log(text.replaceBetween(1, 10, "fuck everything"));
        subUrls.push(subUrl);
    }
    return urls;
}

function replaceUrls(hrefIndices, imgIndices, text){
    var diff = 0;
    while(hrefIndices.length > 0){
        var index1 = hrefIndices.shift() - 7 - diff;
        var index2 = imgIndices.shift() -4 - diff;
        var url = text.substring(index1, index2);
        var subUrl = url.substring(url.indexOf("/", url.indexOf("/") + 50)); //I have no idea why this line works but it does
        subUrl = '"https://s3-us-west-2.amazonaws.com/peter-jive-dump/images' + subUrl + '"';
        //console.log(subUrl);
        text = text.replaceBetween(index1 + 10, index2 + 2, subUrl);
        diff = diff + (url.length - subUrl.length) + 2;

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
        console.log(subUrl);
        text = text.replaceBetween(index1 - 37, index2+2, subUrl);
        diff = diff + (url.length - subUrl.length) + 39;

    }
    return text;
}

//console.log(replaceUrlSrc(srcIndices, otherIndices, text));
// var urls = getImageUrls(hrefIndices, imgIndices, text);
// console.log(urls);
// console.log(text);


function cvtToHTML(text){
    var index1 = text.indexOf('<body>');
    var index2 = text.indexOf('</body>') + 7;
    console.log(index1, index2)
    var final = text.substring(index1, index2);
    return final;
}

function checkForContents(text){
    var index1 = text.indexOf('<div class=') + 37;
    var index2 = text.indexOf('</div><!-- [DocumentBodyEnd');
    console.log(index1, index2, "substring:", text.substring(index1, index2));
    if(text.substring(index1, index2).length > 0){
        return true;
    }else{
        return false;
    }
}

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

function getSubject(text){
    return (text.substring(text.indexOf('"subject"')+11, text.indexOf('viewCount')-3)).replaceAll("/", "-");
}

function removeStupidSlash(text)











