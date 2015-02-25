var WordFreq1 = require('wordfreq');
var WordFreq2 = require('wordfreq');

var clusterfck = require("clusterfck");
var kmeans = new clusterfck.Kmeans();

var fs = require('fs');

var options1 = {
    workerUrl: 'node_modules/wordfreq/src/wordfreq.worker.js',
    maxiumPhraseLength: 6,
    minimumCount: 60
};
var options2 = {
    workerUrl: 'node_modules/wordfreq/src/wordfreq.worker.js',
    maxiumPhraseLength: 6,
    minimumCount: 1
};

var wordfreq1 = WordFreq1(options1);

var alldata = [];//特徵
var text = []; //所有文章分詞
function runAllCache(cb) {
    var search = alldata;
    var searchHash = {};
    var sl = search.length;
    var NewData = [];

    for (var i = 0; i < sl; i++) {
        searchHash[search[i]] = true;
    };

    for (var x = 0; x < text.length; x++) {
        var inputWords = text[x];
        var wordFreq = {};

        for (var i = 0; i < inputWords.length; i++) {
            var a = inputWords[i][0];
            if (searchHash[a]) {
                wordFreq[a] = inputWords[i][1];
            };
        };
        var newarr = Array.apply(null, new Array(sl)).map(Number.prototype.valueOf, 0);

        Object.keys(wordFreq).forEach(function (key, index) {
            var a = alldata.indexOf(key);
            newarr[a] = wordFreq[key];
        });
        NewData.push(newarr);
    };
    cb(NewData);
};

var i = 0;
function checkEN(str) {
    var regExp = /^[\d|a-zA-Z]+$/igm;
    if (regExp.test(str) && (str.match('M503') || str.match('CNN') || str.match('B22816') || str.match('B-22816') || str.match('GE235') || str.match('GE-235') || str.match('ATR72') || str.match('ATR-72') || str.match('ATR72-600') || str.match('ATR-72-600') || str.match('ATR72-500') || str.match('mayday') || str.match('Mayday') || str.match('line') || str.match('LINE'))) {
        return true;
    } else {
        return false;
    };
};
function checkTW(str) {
    var regExp = /[^\u4e00-\u9fa5]/igm;
    if (regExp.test(str)) {
        return false;
    } else {
        return true;
    };
};

var addthat = function (value1, value2) {
    var result = [];
    value2.forEach(function (element1, index1, array1) {
        var _result = [];
        value1.forEach(function (element2, index2, array2) {
            var __result = [];
            element1.forEach(function (_element, _index, _array) {
                __result.push(element1[_index] + element2[_index] / 2);
            });
            _result.push(__result);
        });
        result.push(_result);
    });
    return result;
};
var diffthat = function (value1, value2) {
    var result = [];
    value2.forEach(function (element1, index1, array1) {
        var _result = [];
        value1.forEach(function (element2, index2, array2) {
            var __result = [];
            element1.forEach(function (_element, _index, _array) {
                __result.push(Math.abs(element1[_index] - element2[_index]));
            });
            _result.push(__result);
        });
        result.push(_result);
    });
    return result;
};
function copy() {
    if (i == 9275) {
        var data = wordfreq1.getList();
        for (var a = 0; a < data.length; a++) {
            if (checkEN(data[a][0]) || checkTW(data[a][0])) {
                alldata.push(data[a][0]);
            };
        };
        console.log('特徵長度： ' + wordfreq1.getLength() + ' ------ ' + alldata.length);

        runAllCache(function (cb) {
            for (var k = 2; k < 11; k++) {
                //var optionss = { encoding: "utf8" };
                var optionss = {};

                fs.writeFileSync('../NEWS/reki/all/新增資料夾/總分詞.txt', alldata.join(','), optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });

                var dataq = '';
                for (var i = 0; i < cb.length; i++) {
                    dataq += '[' + cb[i].join(',') + '],' + '\r\n';
                };
                fs.writeFileSync('../NEWS/reki/all/新增資料夾/陣列.txt', dataq, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });

                var data = '';
                for (var i = 0; i < cb.length; i++) {
                    data += cb[i].join(',') + '\r\n';
                };
                fs.writeFileSync('../NEWS/reki/all/新增資料夾/總統計.txt', data, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });
                console.log('ALL OK');

                var clusters = kmeans.cluster(cb, k);
                //var clusters = clusterfck.kmeans(cb, 3);
                var centroids = kmeans.centroids;

                var arrayans;
                for (var i = 0; i < centroids.length; i++) {
                    arrayans = diffthat(clusters[i], [centroids[i]]);
                };

                var c = [];
                var b = Array.apply(null, new Array(arrayans[0][0].length)).map(Number.prototype.valueOf, 0);
                var e = 0;

                for (var i = 0; i < arrayans.length; i++) {
                    var aa = arrayans[i];
                    for (var ii = 0; ii < aa.length; ii++) {
                        var bb = aa[ii];
                        for (var j = 0; j < bb.length; j++) {
                            b[j] += bb[j];
                        };
                        e++;
                    };
                };
                for (var i = 0; i < b.length; i++) {
                    b[i] = b[i] / e;
                };


                var dataq = '';
                dataq += '[' + b.join(',') + '],' + '\r\n';
                fs.writeFileSync('../NEWS/reki/all/新增資料夾/各群點到中心點距離總平均差 K' + k + '.txt', dataq, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });

                var dataq = '';
                for (var i = 0; i < clusters.length; i++) {
                    dataq += '[' + clusters[i].join(',') + '],' + '\r\n';
                };
                fs.writeFileSync('../NEWS/reki/all/新增資料夾/分群結果 K' + k + '.txt', dataq, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });

                var b = Array.apply(null, new Array(centroids[0].length)).map(Number.prototype.valueOf, 0);
                for (var i = 0; i < centroids.length; i++) {
                    var aa = centroids[i];
                    for (var j = 0; j < aa.length; j++) {
                        b[j] += parseInt(aa[j]);
                    };
                };
                for (var i = 0; i < b.length; i++) {
                    b[i] = parseInt(b[i]) / centroids.length;
                };
                var dataq = '';
                dataq += '[' + b.join(',') + '],' + '\r\n';
                fs.writeFileSync('../NEWS/reki/all/新增資料夾/群中心平均 K' + k + '.txt', dataq, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });

                var sumx = [];
                for (var q = 0; q < clusters.length; q++) {
                    var a = clusters[q];
                    var sum = Array.apply(null, new Array(a[0].length)).map(Number.prototype.valueOf, 0);

                    for (var i = 0; i < a.length; i++) {
                        var aa = a[i];
                        for (var j = 0; j < aa.length; j++) {
                            sum[j] += parseInt(aa[j]);
                        };
                    };
                    sumx.push(sum);
                    //console.log(sum.sort(function (a, b) { return b - a; }))
                };

                var dataq = '';
                var dataqq = [];

                for (var i = 0; i < sumx.length; i++) {
                    dataq += '[' + sumx[i].join(',') + '],' + '\r\n';
                    dataqq.push([]);
                    for (var j = 0; j < sumx[i].length; j++) {
                        dataqq[i].push({ text: alldata[j], count: sumx[i][j] });
                    };
                };

                fs.writeFileSync('../NEWS/reki/all/新增資料夾/各分群分詞(來源-未排) K' + k + '.txt', dataq, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });

                var jsonText = '';
                for (var i = 0; i < dataqq.length; i++) {
                    jsonText += JSON.stringify(dataqq[i], "\t") + '\r\n';
                };

                fs.writeFileSync('../NEWS/reki/all/新增資料夾/各分群分詞(字詞-未排) K' + k + '.txt', jsonText, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });

                var arrydata = dataqq.slice(0);
                var jsonText = '';
                for (var i = 0; i < arrydata.length; i++) {
                    var a = arrydata[i];
                    a.sort(function (a, b) {
                        if (a.count < b.count) {
                            return 1;
                        };
                        if (a.count > b.count) {
                            return -1;
                        };
                        return 0;
                    });
                    jsonText += JSON.stringify(a, "\t") + '\r\n';
                };
                fs.writeFileSync('../NEWS/reki/all/新增資料夾/各分群分詞(字詞-排序) K' + k + '.txt', jsonText, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });

                var arryans = [];
                for (var j = 0; j < clusters.length; j++) {
                    var aa = clusters[j];
                    arryans.push([]);
                    for (var _k = 0; _k < aa.length; _k++) {
                        var bb = aa[_k].join('');
                        for (var i = 0; i < cb.length; i++) {
                            var cc = cb[i].join('');
                            if (cc == bb) {
                                arryans[j].push(i);
                                break;
                            };
                        };
                    };
                };
                var dataq = '';
                for (var i = 0; i < arryans.length; i++) {
                    dataq += '[' + arryans[i].join(',') + '],' + '\r\n';
                };
                fs.writeFileSync('../NEWS/reki/all/新增資料夾/各分群內含文章 K' + k + '.txt', dataq, optionss, function (error) {
                    if (error) {
                        console.log('Error');
                    } else {
                        console.log('OK');
                    };
                });
            };
        });
        return false;
    };

    var file = '../NEWS/reki/all/新增資料夾/' + i + '.txt';
    fs.readFile(file, 'utf8', function (err, data) {
        wordfreq1.process(data);
        var wordfreq2 = WordFreq2(options2);

        wordfreq2.process(data);
        var a = wordfreq2.getList();
        text.push(a);
        console.log('OK   ' + i);
        i += 1;
        copy();
    });
};

copy();