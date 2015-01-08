﻿'use strict';
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

; (function ($) {

    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        a256 = '',
        r64 = [256],
        r256 = [256],
        i = 0;

    var UTF8 = {

        /**
         * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
         * (BMP / basic multilingual plane only)
         *
         * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
         *
         * @param {String} strUni Unicode string to be encoded as UTF-8
         * @returns {String} encoded string
         */
        encode: function (strUni) {
            // use regular expressions & String.replace callback function for better efficiency
            // than procedural approaches
            var strUtf = strUni.replace(/[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
            function (c) {
                var cc = c.charCodeAt(0);
                return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
            })
            .replace(/[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
            function (c) {
                var cc = c.charCodeAt(0);
                return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
            });
            return strUtf;
        },

        /**
         * Decode utf-8 encoded string back into multi-byte Unicode characters
         *
         * @param {String} strUtf UTF-8 string to be decoded back to Unicode
         * @returns {String} decoded string
         */
        decode: function (strUtf) {
            // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
            var strUni = strUtf.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars
            function (c) { // (note parentheses for precence)
                var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
                return String.fromCharCode(cc);
            })
            .replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars
            function (c) { // (note parentheses for precence)
                var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
                return String.fromCharCode(cc);
            });
            return strUni;
        }
    };

    while (i < 256) {
        var c = String.fromCharCode(i);
        a256 += c;
        r256[i] = i;
        r64[i] = b64.indexOf(c);
        ++i;
    }

    function code(s, discard, alpha, beta, w1, w2) {
        s = String(s);
        var buffer = 0,
            i = 0,
            length = s.length,
            result = '',
            bitsInBuffer = 0;

        while (i < length) {
            var c = s.charCodeAt(i);
            c = c < 256 ? alpha[c] : -1;

            buffer = (buffer << w1) + c;
            bitsInBuffer += w1;

            while (bitsInBuffer >= w2) {
                bitsInBuffer -= w2;
                var tmp = buffer >> bitsInBuffer;
                result += beta.charAt(tmp);
                buffer ^= tmp << bitsInBuffer;
            }
            ++i;
        }
        if (!discard && bitsInBuffer > 0) result += beta.charAt(buffer << (w2 - bitsInBuffer));
        return result;
    }

    var Plugin = $.base64 = function (dir, input, encode) {
        return input ? Plugin[dir](input, encode) : dir ? null : this;
    };

    Plugin.btoa = Plugin.encode = function (plain, utf8encode) {
        plain = Plugin.raw === false || Plugin.utf8encode || utf8encode ? UTF8.encode(plain) : plain;
        plain = code(plain, false, r256, b64, 8, 6);
        return plain + '===='.slice((plain.length % 4) || 4);
    };

    Plugin.atob = Plugin.decode = function (coded, utf8decode) {
        coded = coded.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        coded = String(coded).split('=');
        var i = coded.length;
        do {
            --i;
            coded[i] = code(coded[i], true, r64, a256, 6, 8);
        } while (i > 0);
        coded = coded.join('');
        return Plugin.raw === false || Plugin.utf8decode || utf8decode ? UTF8.decode(coded) : coded;
    };
}(jQuery));
if (!window.btoa) window.btoa = $.base64.btoa;
if (!window.atob) window.atob = $.base64.atob;

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

EasyFile.prototype.loadFile = function (blob) {
    this.data.blob = blob;
    this.data.name = blob.name;
    this.data.type = blob.type;
    this.data.id = this.setID();
    this.data.sha1 = new jsSHA(blob, "TEXT").getHash("SHA-1", "HEX");
    this.data.size = blob.size;
};
EasyFile.prototype.setID = function (id) {
    var shaObj;
    if (typeof id != 'undefined') {
        shaObj = id;
    } else {
        shaObj = new jsSHA(this.data.blob, "TEXT").getHash("SHA-1", "HEX");
    };
    return shaObj;
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
    var temp = Math.floor((splitByte) / 0.75);
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
    var b = Math.floor((splitByte) / 0.75); //切割Byte轉base64長度
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
    var data = {
        id: this.data.id,
        name: this.data.name,
        type: this.data.type,
        size: this.data.size,
        sha1: this.data.sha1,
        blob: this.data.blob
    };
    return data;
};
EasyFile.prototype.toBase64 = function (cb) {
    var reader = new FileReader();
    reader.onloadend = function (e) {
        if (e.target.readyState == FileReader.DONE) {
            var blob = String(e.target.result).split(';base64,')[1];
            cb(blob);
        };
    };
    reader.readAsDataURL(this.data.blob);
};
EasyFile.prototype.toBlob = function () {
    return new Blob([this.data.blob], { 'type': this.data.type });;
};