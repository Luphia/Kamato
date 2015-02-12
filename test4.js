var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');

var d1 = 'http://localhost:3000/all.html';
function CacheData(url, cb) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            $('.softmerge-inner').each(function () {
                var data = $(this).text();
                cb(data);
            });
        };
    });
};

var uuid = 0;
CacheData(d1, function (cb) {
    var options = { encoding: "utf8" };
    var dir = '../NEWS/reki/all/';
    var file = dir + uuid + '.txt';
    uuid++;
    fs.writeFileSync(file, cb, options, function (error) {
        if (error) {
            console.log('Error');
        } else {
            console.log('OK');
        };
    });
});