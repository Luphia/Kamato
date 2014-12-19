var db = {};

var edb=require('./services/Classes/EasyDB.js');
db['a'] = new edb();
db['b'] = new edb();
db['c'] = new edb();

db['a'].connect({url: 'mongodb://10.10.23.31:27010/ooo'});
db['b'].connect({url: 'mongodb://10.10.23.31:27010/admin'});
db['c'].connect({url: 'mongodb://10.10.23.31:27010/easyDB'});

console.log(db['a'].listTable());
console.log(db['b'].listTable());
console.log(db['c'].listTable());
console.log(db['a'].getTable('member'));