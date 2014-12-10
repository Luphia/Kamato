var fs = require('fs')
,	sub = 'json'
,	modules = {}
,	reg = new RegExp('\.' + sub + '$')
,	files = fs.readdirSync(__dirname)
;

for(var key in files) {
	if(reg.test(files[key]) && files[key] != 'index.js') {
		var name = files[key].substr(0, files[key].length - sub.length - 1);
		modules[name] = require('./' + files[key]);
	}
}

module.exports = modules;