/*

- html5 file api
http://www.html5rocks.com/en/tutorials/file/dndfiles/

file data
{
	id: [sha1]
	name: [file name] 
	type: [file type]
	sha1: [file hash] 
	size: [file size]
	slices: 
	sha1
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

var makeCRCTable = function() {
	var c;
	var crcTable = [];
	for(var n = 0; n < 256; n++){
		c = n;
		for(var k = 0; k < 8; k++){
			c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
		}
		crcTable[n] = c;
	}
	return crcTable;
};

var crc32 = function(str) {
	var crcTable = makeCRCTable()
	var crc = 0 ^ (-1);

	for (var i = 0; i < str.length; i++ ) {
		crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
	}

	return (crc ^ (-1)) >>> 0;
};

var EasySlice = function() {};

var EasyFile = function() {};
EasyFile.prototype.setID = function() {};
EasyFile.prototype.getID = function() {};
EasyFile.prototype.reset = function() {};
EasyFile.prototype.getProgress = function() {};
EasyFile.prototype.done = function() {};
EasyFile.prototype.setCallback = function() {};
EasyFile.prototype.addSlice = function() {};
EasyFile.prototype.split = function() {};
EasyFile.prototype.getSliceID = function() {};
EasyFile.prototype.getSlice = function() {};
EasyFile.prototype.countSlice = function() {};
EasyFile.prototype.toJSON = function() {};
EasyFile.prototype.toBase64 = function() {};
EasyFile.prototype.toBlob = function() {};