var cio = require('socket.io-client');
var nGram = require('n-gram');
var http = require('http');

//var exec = require('child_process').exec;
//function execute(command, callback) {
//    exec(command, function (error, stdout, stderr) { callback(stdout); });
//};

//execute();

function SD(values) {
    var avg = average(values);
    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });
    var avgSquareDiff = average(squareDiffs);
    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
};
function average(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);
    var avg = sum / data.length;
    return avg;
};

var search = text.split(' ');
var searchHash = {}
for (var i = 0; i < search.length; i++) {
    searchHash[search[i]] = true;
};

var inputWords = search;
var wordFreq = {};
var item = { total: 0, totalitemcount: 0, totalitemkey: 0, totalitem: {}, totalitemkeys: [] };
for (var i = 0; i < inputWords.length; i++) {
    if (searchHash[inputWords[i]]) {
        wordFreq[inputWords[i]] = wordFreq[inputWords[i]] || 0;
        wordFreq[inputWords[i]]++;
        item.total++;
    };
};
Object.keys(wordFreq).forEach(function (key, index) {
    item.totalitem[index] = { text: key, count: wordFreq[key] };
    item.totalitemcount = index + 1;
    item.totalitemkey += wordFreq[key];
    item.totalitemkeys.push(wordFreq[key]);
    //console.log(key + ": " + wordFreq[key]);
});
console.log("Total matches: " + item.total);

var avg = item.totalitemkey / item.totalitemcount;

console.log("Total item: " + avg);
console.log("SD: " + SD(item.totalitemkeys));



//var natural = require('natural');
//var NGrams = natural.NGrams;
//var NGramsZH = natural.NGramsZH;

//var natural = require('natural'),
//    TfIdf = natural.TfIdf,
//    tfidf = new TfIdf();

//tfidf.addDocument(['document', 'about', 'node']);
//tfidf.addDocument(['document', 'about', 'ruby']);
//tfidf.addDocument(['document', 'about', 'ruby', 'node']);
//tfidf.addDocument(['document', 'about', 'node', 'node', 'examples']);

//tfidf.listTerms(0).forEach(function (item) {
//    console.log(item.term + ': ' + item.tfidf);
//});

//var text = 'Orz how are you 中文測試';

//function cheEng(acttype) {
//    if (acttype == 0) {
//        return text.replace(/[ -~]/g, "");
//    };
//    if (acttype == 1) {
//        return text.replace(/[^a-zA-Z0-9_ ]/g, "");
//    };
//};
//console.log(cheEng(1));

//console.log(NGrams.ngrams('Orz how are you 中文測試', 2));
//console.log(NGramsZH.ngrams('Orz how are you 中文測試', 2));

//var socket = cio('https://10.10.23.55/_news', { autoConnect: true, secure: true });

//var fs = require('fs');
//var dir = '../NEWS/';

//if (!fs.existsSync(dir)) {
//    fs.mkdirSync(dir);
//};
//socket.on('connect', function () {
//    console.log('Start');
//});

//socket.on('BM', function (datas) {
//    var id = datas.id;
//    var data = datas.data;

//    var option = {
//        hostname: '10.10.23.31',
//        port: 9200,
//        path: '/bigdata/_analyze?pretty=1&analyzer=ngram_analyzer',
//        method: 'POST'
//    };

//    var req = http.request(option, function (res) {
//        res.setEncoding('utf8');
//        console.log('BM Receive Start -- ' + id);

//        var dataz = '', dataq, datal = 0;

//        res.on('data', function (chunk) {
//            dataz += chunk;
//        });
//        res.on('end', function () {
//            var RightNow = new Date();
//            var uuid = RightNow.getFullYear() + "-" + RightNow.getMonth() + 1 + "-" + RightNow.getDate() + " " + RightNow.getHours() + "-" + RightNow.getMinutes() + "-" + id;
//            var file = dir + uuid + '.txt';

//            dataq = JSON.parse(dataz).tokens;
//            datal = dataq.length;
//            var ndata = '';
//            for (var i = 0; i < datal; i++) {
//                ndata += dataq[i].token + '\n';
//            };
//            var options = { encoding: "utf8" };
//            fs.writeFile(file, data + "\r\n" + "//" + "\r\n" + ndata, options, function (error) {
//                if (error) {
//                    console.log('Error');
//                } else {
//                    console.log('OK');
//                };
//            });
//        });
//    });
//    req.on('error', function (e) {
//        console.log('problem with request: ' + e.message);
//    });
//    req.write(data);
//    req.end();



//    //var ndata = '';
//    //for (var i = 2; i < 7; i++) {
//    //    ndata += '\n' + nGram(i)(data).join('\n');
//    //    if (i == 6) {
//    //        fs.writeFileSync(file, data + "\r\n" + "//" + "\r\n" + ndata, options, function (error) {
//    //            if (error) {
//    //                console.log('Error');
//    //            } else {
//    //                console.log('OK');
//    //            };
//    //        });
//    //    };
//    //};
//});
//socket.on('PM', function () {
//    console.log('PM Receive Start');

//});