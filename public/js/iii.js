'use strict';

var splitbase64 = function (base64, KB) {
    var x = String(base64).length; // base64 大小
    var y = x * 0.75;              //真實檔案大小
    var z = Math.floor((KB * 1000) / 0.75);//切割KB轉base64長度

    var ln1 = Math.floor(x / z);              //段數
    var ln2 = x % z;              //剩下長度

    var temp = 0;

    for (var i = 0; i < ln1; i++) {
        var a = z + temp;
        console.log(base64.substring(temp, a));
        temp += z;
    };

    if (ln2 > 0) {
        console.log(base64.substring(temp));
    };

    console.log(x, y)
    console.log(ln1, ln2)
    console.log(z)

};