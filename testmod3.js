var cio = require('socket.io-client');
var http = require('http');

function SD(a) {
    var r = { mean: 0, variance: 0, deviation: 0 }, t = a.length;
    for (var m, s = 0, l = t; l--; s += a[l]);
    for (m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
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
console.log("SD: " + JSON.stringify(SD(item.totalitemkeys)));