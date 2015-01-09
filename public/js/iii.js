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