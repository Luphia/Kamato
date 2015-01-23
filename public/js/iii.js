'use strict';
/*

- html5 file api
http://www.html5rocks.com/en/tutorials/file/dndfiles/

file data
{
	id: [sha1]
	name: [file name] 
	type: [file type]
	size: [file size]
	sha1: [file hash] 
	blob
}

slice data
{
	id: [fileID]_[slice number]_[total slices]_[CRC]
	type: EasyFile
	sha1
	blob
}

setID
getID

reset
getProgress
done
setCallback

addSlice

split
getSliceID
getSlice
countSlice

toJSON
toBase64
toBlob

*/

//byte轉文字
var btw = function (a) {
    for (var b = [], c = 0, d = 0; c < a.length; c++, d += 8) {
        b[d >>> 5] |= a[c] << 24 - d % 32;
    };
    return b;
};
//byte轉hex
var bth = function (a) {
    for (var b = [], c = 0; c < a.length; c++) {
        b.push((a[c] >>> 4).toString(16)), b.push((a[c] & 15).toString(16));
    };
    return b.join("");
};
//文字轉byte
var wtb = function (a) {
    for (var b = [], c = 0; c < a.length * 32; c += 8) {
        b.push(a[c >>> 5] >>> 24 - c % 32 & 255);
    };
    return b;
};
//背景編碼
function sha1(m, hash) {
    var w = [];
    var H0 = hash[0], H1 = hash[1], H2 = hash[2], H3 = hash[3], H4 = hash[4];
    for (var i = 0; i < m.length; i += 16) {
        var a = H0, b = H1, c = H2, d = H3, e = H4;
        for (var j = 0; j < 80; j++) {
            if (j < 16) {
                w[j] = m[i + j] | 0;
            } else {
                var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
                w[j] = (n << 1) | (n >>> 31);
            };
            var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 : j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 : j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 : (H1 ^ H2 ^ H3) - 899497514);
            H4 = H3;
            H3 = H2;
            H2 = (H1 << 30) | (H1 >>> 2);
            H1 = H0;
            H0 = t;
        };
        H0 = (H0 + a) | 0;
        H1 = (H1 + b) | 0;
        H2 = (H2 + c) | 0;
        H3 = (H3 + d) | 0;
        H4 = (H4 + e) | 0;
    };
    return [H0, H1, H2, H3, H4];
};
//編碼檔案 支援2G以上
function hash_file(file, workers) {
    //對應nodejs 內建分段區塊
    var buffer_size = 64 * 16 * 1024;
    var block = {
        'file_size': file.size,
        'start': 0
    };
    var threads = 0;
    var reader = new FileReader();
    var blob;
    var handle_hash_block = function (event) {
        threads -= 1;
        if (threads === 0) {
            if (block.end !== file.size) {
                block.start += buffer_size;
                block.end += buffer_size;

                if (block.end > file.size) {
                    block.end = file.size;
                };

                reader = new FileReader();
                reader.onload = handle_load_block;
                blob = file.slice(block.start, block.end);
                reader.readAsArrayBuffer(blob);
            };
        };
    };
    var handle_load_block = function (event) {
        for (i = 0; i < workers.length; i += 1) {
            threads += 1;
            workers[i].postMessage({
                'message': event.target.result,
                'block': block
            });
        };
    };

    block.end = buffer_size > file.size ? file.size : buffer_size;

    for (var i = 0; i < workers.length; i += 1) {
        workers[i].addEventListener('message', handle_hash_block);
    };

    reader.onload = handle_load_block;
    blob = file.slice(block.start, block.end);
    reader.readAsArrayBuffer(blob);
};

self.hash = [1732584193, -271733879, -1732584194, 271733878, -1009589776];
//監聽works
self.addEventListener('message', function (event) {

    var uint8_array, message, block, nBitsTotal, output, nBitsLeft, nBitsTotalH, nBitsTotalL;

    uint8_array = new Uint8Array(event.data.message);
    message = btw(uint8_array);
    block = event.data.block;
    event = null;
    uint8_array = null;
    output = {
        'block': block
    };

    if (block.end === block.file_size) {
        nBitsTotal = block.file_size * 8;
        nBitsLeft = (block.end - block.start) * 8;
        nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
        nBitsTotalL = nBitsTotal & 0xFFFFFFFF;

        //填補區塊
        message[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
        message[((nBitsLeft + 64 >>> 9) << 4) + 14] = nBitsTotalH;
        message[((nBitsLeft + 64 >>> 9) << 4) + 15] = nBitsTotalL;

        self.hash = sha1(message, self.hash);
        //byte轉hex
        output.result = bth(wtb(self.hash));
    } else {
        self.hash = sha1(message, self.hash);
    };
    message = null;
    self.postMessage(output);
}, false);

var makeCRCTable = function () {
    var c;
    var crcTable = [];
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
};

var crc32 = function (str) {
    var crcTable = makeCRCTable()
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

var EasySlice = function () { };

var EasyFile = function () {
    this.data = {};
};

EasyFile.prototype.loadFile = function (blob, cb) {
    this.data.blob = blob;
    var that = this;
    that.getSha1(function (data) {
        that.data.sha1 = data;
        that.data.name = blob.name;
        that.data.type = blob.type;
        that.data.id = that.setID();
        that.data.size = blob.size;
        cb(that);
    });
};
EasyFile.prototype.setID = function (id) {
    if (typeof id != 'undefined') {
        return id;
    } else {
        return this.data.sha1;
    };
};
EasyFile.prototype.getSha1 = function (cb) {
    var file = this.data.blob;
    var sha1 = CryptoJS.algo.SHA1.create();
    var read = 0;
    var unit = 1024 * 1024;
    var blob;
    var reader = new FileReader();
    reader.readAsArrayBuffer(file.slice(read, read + unit));
    reader.onload = function (event) {
        var bytes = CryptoJS.lib.WordArray.create(event.target.result);
        sha1.update(bytes);
        read += unit;
        if (read < file.size) {
            $('#progress-bar').text((read / file.size * 100) + '%');
            blob = file.slice(read, read + unit);
            reader.readAsArrayBuffer(blob);
        } else {
            var hash = sha1.finalize();
            cb(hash.toString(CryptoJS.enc.Hex));
        };
    };
};
EasyFile.prototype.getID = function () {
    return this.data.id;
};
EasyFile.prototype.reset = function () {
    var num = this.countSlice();
    this.progress = new Array(num);
};
EasyFile.prototype.getProgress = function () {
    var progress = this.progress;
    var count = progress.length;
    var ok = 0;
    for (var i = 0; i < count; i++) {
        if (progress[i] == true) {
            ok += 1;
        };
    };
    var ans = ok / count;
    return ans;
};
EasyFile.prototype.done = function (num) {
    num -= 1;
    this.progress[num] = true;
    var final = this.getProgress();
    if (final == 1) {
        this.callback(false, true);
    };
};
EasyFile.prototype.setCallback = function (callback) {
    if (typeof (callback) != "function") {
        alert('your setCallback is not function');
        return false;
    };
    this.callback = callback;
};
EasyFile.prototype.addSlice = function (data) {

    var id = data.id.split('_')[0];
    var sid = parseInt(data.id.split('_')[1], 10) - 1;
    var tid = parseInt(data.id.split('_')[2], 10);

    if (typeof this.Slice == 'undefined') {
        this.Slice = new Array(tid);
        this.progress = new Array(tid);
    };

    this.data.id = id;
    this.data.name = data.name;
    this.data.type = data.type;
    this.data.size = data.size;
    this.data.sha1 = id;
    this.progress[sid] = true;
    this.Slice[sid] = data.blob;

    var final = this.getProgress();

    if (final == 1) {
        this.data.blob = this.Slice.join('');
    };

};
EasyFile.prototype.split = function (Byte) {
    this.splitByte = Byte;
    this.reset();
};
EasyFile.prototype.getSliceID = function (num) {
    if (num <= 0) {
        this.callback('your getSliceID is error');
        return;
    };
    var countSlice = this.countSlice();
    var str = this.getID() + '_' + num + '_' + countSlice + '_';
    var strcrc32 = crc32(str);
    return str + strcrc32;
};
EasyFile.prototype.getSlice = function (num) {
    var blob = this.data.blob;
    var splitByte = this.splitByte;
    var countSlice = this.countSlice();
    var temp = splitByte;// Math.floor((splitByte) / 0.75);
    var id = this.getSliceID(num);
    var type = this.data.type;

    if (countSlice == num && blob.size < splitByte) {
        var slblob = blob.slice(0, blob.size, type);
        var data = {
            id: id,
            type: 'EasyFile',
            sha1: new jsSHA(slblob, "TEXT").getHash("SHA-1", "HEX"),
            blob: slblob
        };
        return data;
    } else if (countSlice >= num && blob.size > splitByte) {
        var start = temp * num - temp;
        var end = temp * num;

        var slblob = blob.slice(start, end, type);
        var data = {
            id: id,
            type: 'EasyFile',
            sha1: new jsSHA(slblob, "TEXT").getHash("SHA-1", "HEX"),
            blob: slblob
        };
        return data;
    } else {
        this.callback('your getSlice is error');
        return;
    };

    //var a = countSlice[0];
    //var b = countSlice[1];
    //var c = countSlice[2];

    //var temp = 0;

    //for (var i = 0; i < b; i++) {
    //    var aa = a + temp;
    //    this.progress[i] = blob.substring(temp, aa);
    //    temp += a;
    //};

    //if (c > 0) {
    //    this.progress[b] = blob.substring(temp);
    //};

    //console.log(countSlice)
    //console.log(b, c)
    //console.log(a)
    //console.log(this.progress[num])

    //return this.progress[num];

};
EasyFile.prototype.countSlice = function () {
    var blob = this.data.blob;
    var splitByte = this.splitByte; //切割長度
    var a = blob.size;    // base64 大小
    var b = splitByte;// Math.floor((splitByte) / 0.75); //切割Byte轉base64長度
    var c = Math.floor(a / b);  //段數
    var d = a % b;  //剩下長度
    //return [b, c, d];

    if (d > 0) {
        return c + 1;
    } else {
        return c;
    };
};
EasyFile.prototype.toJSON = function () {
    return this;
};
EasyFile.prototype.toBase64 = function (blob, cb) {
    var blob = blob.blob;
    var reader = new FileReader();
    reader.onloadend = function (e) {
        if (e.target.readyState == FileReader.DONE) {
            var temp = String(e.target.result).split(';base64,')[1];
            cb(temp);
        };
    };
    reader.readAsDataURL(blob);
};
EasyFile.prototype.toBlob = function () {
    return new Blob([this.data.blob], { 'type': this.data.type });
};