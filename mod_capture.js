var cio = require('socket.io-client');
var nGram = require('n-gram');
var http = require('http');

var socket = cio('https://10.10.23.55/_news', { autoConnect: true, secure: true });

var fs = require('fs');
var dir = '../NEWS/';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
};
socket.on('connect', function () {
    console.log('Start');
    console.log(socket.io.engine.id);

});

socket.on('BM', function (datas) {
    var id = datas.id;
    var data = datas.data;
    var len = datas.len;
    var cid = datas.cid;

    var option = {
        hostname: '10.10.23.31',
        port: 9200,
        path: '/bigdata/_analyze?pretty=1&analyzer=ngram_analyzer',
        method: 'POST'
    };

    var req = http.request(option, function (res) {
        res.setEncoding('utf8');
        console.log('BM Receive Start -- ' + id + ' --by ' + cid);

        var dataz = '', dataq, datal = 0;

        res.on('data', function (chunk) {
            dataz += chunk;
        });
        res.on('end', function () {
            if (id == len || id == (len - 1) || id == (len - 2)) {
                console.log('--------------------------------again')
                socket.emit('PM', cid, 'again');
            };
            var RightNow = new Date();
            var uuid = RightNow.getFullYear() + "-" + RightNow.getMonth() + 1 + "-" + RightNow.getDate() + " " + RightNow.getHours() + "-" + RightNow.getMinutes() + "-" + id;
            var file = dir + uuid + '.txt';
            dataq = JSON.parse(dataz).tokens;
            if (dataq && dataq.length >= 1) {
                datal = dataq.length;
                var ndata = '';
                for (var i = 0; i < datal; i++) {
                    ndata += dataq[i].token + '\n';
                };
                var options = { encoding: "utf8" };
                fs.writeFile(file, data + "\r\n" + "//" + "\r\n" + ndata, options, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK   ' + id + ' ----- ' + len);
                    };
                });
            } else {
                console.log(id + ' --------------------------------- Lost');
            };
        });
    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    req.end(data);

    //var ndata = '';
    //for (var i = 2; i < 7; i++) {
    //    ndata += '\n' + nGram(i)(data).join('\n');
    //    if (i == 6) {
    //        fs.writeFileSync(file, data + "\r\n" + "//" + "\r\n" + ndata, options, function (error) {
    //            if (error) {
    //                console.log('Error');
    //            } else {
    //                console.log('OK');
    //            };
    //        });
    //    };
    //};
});
socket.on('PM', function () {
    console.log('PM Receive Start');

});