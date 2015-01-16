var Result = require('../Classes/Result.js')
, EasyDB = require('../Classes/EasyDB.js')
, util = require('util')
, events = require('events')
, url = require('url')
, config
, logger
, DB
, MDB

var manage = function() {};

util.inherits(manage, events.EventEmitter);

manage.prototype.listTable = function (req, res, next) {
	var userID = req.session.simple._id;
	var data = this.connect(userID).listTable();
	res.result.response(next, 1, 'list all table', data);
};
manage.prototype.getSchema = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var data = this.connect(userID).getTable(table);

	if (data) {
		res.result.response(next, 1, 'table schema: ' + table, data);
	}
	else {
		res.result.response(next, 1, 'table not found: ' + table);
	}
};
manage.prototype.flowData = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var query = req.query.q;
	var data = this.connect(userID).flowData(table, query);

	if (data) {
		res.result.response(next, 1, 'Data in table : ' + table, data);
	}
	else {
		res.result.response(next, 1, 'table not found: ' + table);
	}
};
manage.prototype.pageData = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var query = req.query.q;
	var data = this.connect(userID).pageData(table, query);

	if (data) {
		res.result.response(next, 1, 'Data in table : ' + table, data);
	}
	else {
		res.result.response(next, 1, 'table not found: ' + table);
	}
};
manage.prototype.postTable = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var schema = req.body;
	var rs = this.connect(userID).postTable(table, schema);
	var pass;
	if(rs) {
		pass = "Add new table: " + table;
		res.result.response(next, 1, pass);
	}
	else {
		pass = "Table already exist: " + table;
		res.result.response(next, 0, pass); 
	}
};
manage.prototype.putTable = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var schema = req.body;
	var rs = this.connect(userID).putTable(table, schema);
	var pass = "Update table scehma: " + table;
	res.result.response(next, 1, pass); 
};
manage.prototype.delTable = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var schema = req.body;
	var rs = this.connect(userID).deleteTable(table, schema);
	var pass = "Delete table: " + table;
	res.result.response(next, 1, pass); 
};
manage.prototype.getData = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var id = req.params.id;
	var data = this.connect(userID).getData(table, id);

	if (data) {
		res.result.response(next, 1, 'Data in table : ' + table, data);
	}
	else {
		res.result.response(next, 1, 'table not found: ' + table);
	}
};
manage.prototype.findData = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var query = req.body;
	var data = this.connect(userID).find(table, query);

	if (data) { res.result.response(next, 1, 'Find in table : ' + table, { "list": data }); }
	else { res.result.response(next, 1, 'table not found: ' + table); }
};
manage.prototype.postData = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var query = req.body;
	var data = this.connect(userID).postData(table, query);

	if (data) { res.result.response(next, 1, 'Insert into table : ' + table, data); }
	else { res.result.response(next, 1, 'table not found: ' + table); }
};
manage.prototype.updateData = function (req, res, next) { res.result.response(next, 1, '', { url: req.originalUrl, method: req.method }); }
manage.prototype.putData = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var id = req.params.id;
	var data = req.body;
	var result = this.connect(userID).putData(table, id, data);

	if (data) { res.result.response(next, 1, 'Update table row: ' + table + ' - ' + id); }
	else { res.result.response(next, 1, 'table not found: ' + table); }
};
manage.prototype.delData = function (req, res, next) {
	var userID = req.session.simple._id;
	var table = req.params.table;
	var id = req.params.id;
	var result = this.connect(userID).deleteData(table, id);

	if (result) { res.result.response(next, 1, 'Delete table row: ' + table + ' - ' + id); }
	else { res.result.response(next, 1, 'table not found: ' + table); }
};
manage.prototype.sql = function (req, res, next) {
	var userID = req.session.simple._id;
	var sql = req.body.sql || req.query.sql;
	var data = this.connect(userID).sql(sql);

	if (data) {
		res.result.response(next, 1, sql, data);
	}
	else {
		res.result.response(next, 1, 'sql error', sql);
	}
};
manage.prototype.connect = function (userID) {
	userID = 'easyDB'; //-- for demo

	if (!userID) { return false; }
	else if (DB[userID]) { return DB[userID]; }
	else {
		var db = new EasyDB(config, logger)
		, path = config.uri + userID
		;

		db.connect({ "url": path });
		DB[userID] = db;
		return DB[userID];
	}
};
manage.prototype.dbRoute = function (req, res, next) {
	res.result = new Result();
	var routeURL = url.parse(req.originalUrl).pathname;

	var pass = (req.method == 'GET' && (routeURL.lastIndexOf('/') == routeURL.length - 1) ? 'LIST' : req.method) + routeURL.split('/').length.toString();
	var uri = routeURL.split('/');
	if (req.body.query) {
		pass = "FIND";
	}

	switch (pass) {
		case 'FIND':
			this.findData(req, res, next);
			break;
		case 'LIST4':
			if (req.query.sql) {
				this.sql(req, res, next);
			}
			else {
				this.listTable(req, res, next);
			}
			break;
		case 'GET4':
			this.getSchema(req, res, next);
			break;
		case 'POST4':
			this.postTable(req, res, next);
			break;
		case 'PUT4':
			this.putTable(req, res, next);
			break;
		case 'DELETE4':
			this.delTable(req, res, next);
			break;
		case 'LIST5':
			this.pageData(req, res, next);
			break;
		case 'GET5':
			this.getData(req, res, next);
			break;
		case 'POST5':
			this.postData(req, res, next);
			break;
		case 'PUT5':
			if (req.query.q) {
				this.update(req, res, next);
			}
			else {
				this.putData(req, res, next);
			}
			break;
		case 'DELETE5':
			this.delData(req, res, next);
			break;

		default:
			res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method });
			break;
	}
};

//manage api
manage.prototype.MDBconnect = function () {
	if (MDB) {
		return MDB;
	} else {
		var path = config.uri;
		var db = new EasyDB(config, logger);
		db.connect({ "url": path });
		MDB = db;
		return MDB;
	};
};
manage.prototype.getallapp = function (req, res, next) {
	res.result = new Result();
	var table = 'app';
	var query = req.query.q || '';
	var data = this.MDBconnect().pageData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute showallapp GET Success', data);
	};
};
manage.prototype.getappapi = function (req, res, next) {
	res.result = new Result();
	var table = 'api';
	var query = req.query.q || '';
	var data = this.MDBconnect().pageData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute showappapi GET Success', data);
	};
};
manage.prototype.getappapiinfo = function (req, res, next) {
	res.result = new Result();
	var table = 'api';
	var query = req.query.q || '';
	var data = this.MDBconnect().pageData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute showappapiinfo GET Success', data);
	};
};

manage.prototype.postapp = function (req, res, next) {
	res.result = new Result();
	var table = 'app';
	var info = req.body || '';
	var name = info.name;
	var dbt = this.MDBconnect().listData(table, "name='" + name + "'").list[0];

	if (dbt) {
		res.result.response(next, 0, 'APIRoute postapp POST Fail');
	}
	else {
		var data = this.MDBconnect().postData(table, info);

		if (data) {
			res.result.response(next, 1, 'APIRoute postapp POST Success', { _id: data });
		};
	};
};
manage.prototype.postapi = function (req, res, next) {
	res.result = new Result();
	var table = 'api';
	var info = req.body || '';
	var name = info.name;
	var dbt = this.MDBconnect().listData(table, "name='" + name + "'").list[0];

	if(req.session.simple && req.session.simple.name) { info.owner = req.session.simple.name; }
	else { info.owner ='SIMPLE'; }

	if (dbt) {
		res.result.response(next, 0, 'APIRoute postapi POST Fail');
	} else {
		var data = this.MDBconnect().postData(table, info);

		if (data) {
			res.result.response(next, 1, 'APIRoute postapi POST Success', { _id: data });
		};
	};
};

manage.prototype.putapp = function (req, res, next) {
	res.result = new Result();
	var table = 'app';
	var query = req.body || '';

	var data = this.MDBconnect().putData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute putapp POST Success', { _id: data });
	};
};
manage.prototype.putapi = function (req, res, next) {
	res.result = new Result();
	var table = 'api';
	var query = req.body || '';

	var data = this.MDBconnect().putData(table, query);
	if (data) {
		res.result.response(next, 1, 'APIRoute putapi POST Success', { _id: data });
	};
};
manage.prototype.delapp = function (req, res, next) {
	res.result = new Result();
	var table = 'app';
	var app = req.params.app;

	var query = "_id='" + app + "'";

	var data = this.MDBconnect().deleteData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute delapp POST Success', { _id: data });
	};
};
manage.prototype.delapi = function (req, res, next) {
	res.result = new Result();
	var table = 'api';
	var api = req.params.api;

	var query = "_id='" + api + "'";
	var data = this.MDBconnect().deleteData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute delapi POST Success', { _id: data });
	};
};

//tag api
manage.prototype.getalltag = function (req, res, next) {
	res.result = new Result();
	var table = 'tag';
	var query = req.query.q || '';
	var data = this.MDBconnect().pageData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute getalltag GET Success', data);
	};
};
manage.prototype.gettag = function (req, res, next) {
	res.result = new Result();
	var table = 'tag';
	var query = req.query.q || '';
	var data = this.MDBconnect().pageData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute gettag GET Success', data);
	};
};
manage.prototype.posttag = function (req, res, next) {
	res.result = new Result();
	var table = 'tag';
	var info = req.body || '';

	var data = this.MDBconnect().postData(table, info);

	if (data) {
		res.result.response(next, 1, 'APIRoute posttag POST Success', { _id: data });
	};
};
manage.prototype.puttag = function (req, res, next) {
	res.result = new Result();
	var table = 'tag';
	var query = req.query.q || '';

	var data = this.MDBconnect().putData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute puttag POST Success', { _id: data });
	};
};
manage.prototype.deltag = function (req, res, next) {
	res.result = new Result();
	var table = 'tag';
	var query = req.query.q || '';

	var data = this.MDBconnect().deleteData(table, query);

	if (data) {
		res.result.response(next, 1, 'APIRoute deltag POST Success', { _id: data });
	};
};
manage.prototype.apiRoute = function (req, res, next) {
	res.result = new Result();

	var routeURL = url.parse(req.originalUrl).pathname;
	var method = req.method;
	var app = req.params.app;
	var api = req.params.api;

	switch (method) {
		case 'GET':
			if (!api && !app) {
				this.getallapp(req, res, next);
			};
			if (!api && app) {
				this.getappapi(req, res, next);
			};
			if (api && app) {
				this.getappapiinfo(req, res, next);
			};
			break;
		case 'POST':
			if (!api && !app) {
				this.postapp(req, res, next);
			};
			if (api && app) {
				this.postapi(req, res, next);
			};
			break;
		case 'PUT':
			if (!api && app) {
				this.putapp(req, res, next);
			};
			if (api && app) {
				this.putapi(req, res, next);
			};
			break;
		case 'DELETE':
			if (!api && app) {
				this.delapp(req, res, next);
			};
			if (api && app) {
				this.delapi(req, res, next);
			};
			break;
	};
};
manage.prototype.tagRoute = function (req, res, next) {
	res.result = new Result();

	var routeURL = url.parse(req.originalUrl).pathname;
	var method = req.method;
	var tag = req.params.tag;

	switch (method) {
		case 'GET':
			if (!tag) {
				this.getalltag(req, res, next);
			} else {
				this.gettag(req, res, next);
			};
			break;
		case 'POST':
			if (tag) {
				this.posttag(req, res, next);
			};
			break;
		case 'PUT':
			if (tag) {
				this.puttag(req, res, next);
			};
			break;
		case 'DELETE':
			if (tag) {
				this.deltag(req, res, next);
			};
			break;
	};
};

manage.prototype.init = function (_config, _logger, route) {
	config = _config;
	logger = _logger;
	DB = {};

	var self = this;

	// EasyDB
	route.all('/manage/db/', function(res, req, next) {self.dbRoute(res, req, next);});
	route.all('/manage/db/:table', function(res, req, next) {self.dbRoute(res, req, next);});
	route.all('/manage/db/:table/:id', function(res, req, next) {self.dbRoute(res, req, next);});

	//managerAPI
	route.all('/manage/api/', function(res, req, next) {self.apiRoute(res, req, next);}); //show all app
	route.all('/manage/api/:app', function(res, req, next) {self.apiRoute(res, req, next);}); //show app's api
	route.all('/manage/api/:app/:api', function(res, req, next) {self.apiRoute(res, req, next);}); //show the api info

	route.all('/manage/tag/', function(res, req, next) {self.tagRoute(res, req, next);}); //show all tag
	route.all('/manage/tag/:tag', function(res, req, next) {self.tagRoute(res, req, next);}); //show tag's info
};

var myManage = new manage();

module.exports = myManage;