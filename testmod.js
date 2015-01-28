var cio = require('socket.io-client');
var request = require("request");
var cheerio = require("cheerio");
var Channel = require('./services/Classes/Channel.js');
var fs = require('fs');

var socket = cio('https://10.10.23.57/_news', { autoConnect: true, secure: true });

//var kimo_tvbs = 'https://tw.news.search.yahoo.com/search?p=%E4%BC%8A%E6%96%AF%E8%98%AD+%E6%97%A5%E6%9C%AC&limprovider=GQYDGMJUGQ2OFAEIKRLEEUY';
//var chinatime = 'https://tw.news.search.yahoo.com/search?p=%E4%BC%8A%E6%96%AF%E8%98%AD+%E6%97%A5%E6%9C%AC&limprovider=GQYDGMJUGQ2OFAEI4S4K3ZUZQLUZXO7FVWIOLIFR'
//function CacheData(url, cb) {
//    request(url, function (error, response, body) {
//        if (!error && response.statusCode == 200) {
//            var $ = cheerio.load(body);
//            $('.res a').each(function () {
//                var href = $(this).attr('href');
//                request(href, function (error, response, body) {
//                    var $ = cheerio.load(body);
//                    $('#mediaarticlebody .bd p').slice(1).each(function () {
//                        var data = $(this).text();
//                        if (data.length > 1) {
//                            cb(data);
//                        };
//                    });
//                });
//            });
//            if ($('#pg-next').length >= 1) {
//                var href = $('#pg-next').attr('href');
//                CacheData(href, function (data) {
//                    cb(data);
//                });
//            };
//        };
//    });
//};

var data = {};
function CacheFile(file, cb) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) throw err;
        var datax = data.split('\n');
        for (i = 1; i <= datax.length; i += 2) {
            try {
                cb(JSON.parse(datax[i]).content.replace(/<[^<]*>|&nbsp;/igm, ''));
            } catch (err) {
            };
        };
    });
};


socket.on('connect', function () {
    console.log('Start');
    //CacheData(kimo_tvbs, function (data) {
    //    socket.emit('BM', data);
    //});

    for (var i = 1; i < 5; i++) {
        var file = '../datafiles/bigdata_ng.fulltext.0000000' + i + '.bulk';
        CacheFile(file, function (data) {
            socket.emit('BM', data);
        });
    };
});