var Result = require('../Classes/Result.js')
, EasyDB = require('../Classes/EasyDB.js')
, url = require('url')
, config
, logger
, DB
, MDB

, listTable = function (req, res, next) {
    res.result = new Result();
    var userID = req.session.userID;
    var data = connect(userID).listTable();
    res.result.response(next, 1, 'list all table', data);
}
, getSchema = function (req, res, next) {
    res.result = new Result();
    var userID = req.session.userID;
    var table = req.params.table;
    var data = connect(userID).getTable(table);

    if (data) {
        res.result.response(next, 1, 'table schema: ' + table, data);
    }
    else {
        res.result.response(next, 1, 'table not found: ' + table);
    }
}
, flowData = function (req, res, next) {
    res.result = new Result();
    var userID = req.session.userID;
    var table = req.params.table;
    var query = req.query.q;
    var data = connect(userID).flowData(table, query);

    if (data) {
        res.result.response(next, 1, 'Data in table : ' + table, data);
    }
    else {
        res.result.response(next, 1, 'table not found: ' + table);
    }
}
, pageData = function (req, res, next) {
    res.result = new Result();
    var userID = req.session.userID;
    var table = req.params.table;
    var query = req.query.q;
    var data = connect(userID).pageData(table, query);

    if (data) {
        res.result.response(next, 1, 'Data in table : ' + table, data);
    }
    else {
        res.result.response(next, 1, 'table not found: ' + table);
    }
}
, postTable = function (req, res, next) { res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method }); }
, putTable = function (req, res, next) { res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method }); }
, delTable = function (req, res, next) { res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method }); }
, getData = function (req, res, next) {
    res.result = new Result();
    var userID = req.session.userID;
    var table = req.params.table;
    var id = req.params.id;
    var data = connect(userID).getData(table, id);

    if (data) {
        res.result.response(next, 1, 'Data in table : ' + table, data);
    }
    else {
        res.result.response(next, 1, 'table not found: ' + table);
    }
}
, findData = function (req, res, next) {
    res.result = new Result();
    var userID = req.session.userID;
    var table = req.params.table;
    var query = req.body;
    var data = connect(userID).find(table, query);

    if (data) { res.result.response(next, 1, 'Find in table : ' + table, { "list": data }); }
    else { res.result.response(next, 1, 'table not found: ' + table); }
}
, postData = function (req, res, next) { res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method }); }
, updateData = function (req, res, next) { res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method }); }
, putData = function (req, res, next) { res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method }); }
, delData = function (req, res, next) { res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method }); }
, sql = function (req, res, next) {
    res.result = new Result();
    var userID = req.session.userID;
    var sql = req.body.sql || req.query.sql;
    var data = connect(userID).sql(sql);

    if (data) {
        res.result.response(next, 1, sql, data);
    }
    else {
        res.result.response(next, 1, 'sql error', sql);
    }
}
, connect = function (userID) {
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
}
, dbRoute = function (req, res, next) {
    res.result = new Result();
    var routeURL = url.parse(req.originalUrl).pathname;

    var pass = (req.method == 'GET' && (routeURL.lastIndexOf('/') == routeURL.length - 1) ? 'LIST' : req.method) + routeURL.split('/').length.toString();
    var uri = routeURL.split('/');
    if (req.body.query) {
        pass = "FIND";
    }

    switch (pass) {
        case 'FIND':
            findData(req, res, next);
            break;
        case 'LIST4':
            if (req.query.sql) {
                sql(req, res, next);
            }
            else {
                listTable(req, res, next);
            }
            break;
        case 'GET4':
            getSchema(req, res, next);
            break;
        case 'POST4':
            postTable(req, res, next);
            break;
        case 'PUT4':
            putTable(req, res, next);
            break;
        case 'DELETE4':
            delTable(req, res, next);
            break;
        case 'LIST5':
            pageData(req, res, next);
            break;
        case 'GET5':
            getData(req, res, next);
            break;
        case 'POST5':
            postData(req, res, next);
            break;
        case 'PUT5':
            if (req.query.q) {
                update(req, res, next);
            }
            else {
                putData(req, res, next);
            }
            break;
        case 'DELETE5':
            delData(req, res, next);
            break;

        default:
            res.result.response(next, 1, pass, { url: req.originalUrl, method: req.method });
            break;
    }
}

//manage api
, MDBconnect = function () {
    if (MDB) {
        return MDB;
    } else {
        var path = config.uri;
        var db = new EasyDB(config, logger);
        db.connect({ "url": path });
        MDB = db;
        return MDB;
    };
}

, getallapp = function (req, res, next) {
    res.result = new Result();
    var table = 'app';
    var query = req.query.q || '';
    var data = MDBconnect().pageData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute showallapp GET Success', data);
    };
}
, getappapi = function (req, res, next) {
    res.result = new Result();
    var table = 'api';
    var query = req.query.q || '';
    var data = MDBconnect().pageData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute showappapi GET Success', data);
    };
}
, getappapiinfo = function (req, res, next) {
    res.result = new Result();
    var table = 'api';
    var query = req.query.q || '';
    var data = MDBconnect().pageData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute showappapiinfo GET Success', data);
    };
}

, postapp = function (req, res, next) {
    res.result = new Result();
    var table = 'app';
    var info = req.body || '';

    var data = MDBconnect().postData(table, info);

    if (data) {
        res.result.response(next, 1, 'APIRoute postapp POST Success', { _id: data });
    };
}
, postapi = function (req, res, next) {
    res.result = new Result();
    var table = 'api';
    var info = req.body || '';

    var data = MDBconnect().postData(table, info);

    if (data) {
        console.log(MDBconnect().listData(table));
        res.result.response(next, 1, 'APIRoute postapi POST Success', { _id: data });
    };
}

, putapp = function (req, res, next) {
    res.result = new Result();
    var table = 'app';
    var query = req.body || '';

    var data = MDBconnect().putData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute putapp POST Success', { _id: data });
    };
}
, putapi = function (req, res, next) {
    res.result = new Result();
    var table = 'api';
    var query = req.body || '';

    var data = MDBconnect().putData(table, query);
    if (data) {
        console.log(MDBconnect().listData(table));
        console.log(data);

        res.result.response(next, 1, 'APIRoute putapi POST Success', { _id: data });
    };
}

, delapp = function (req, res, next) {
    res.result = new Result();
    var table = 'app';
    var query = req.query.q || '';

    var data = MDBconnect().deleteData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute putapp POST Success', { _id: data });
    };
}
, delapi = function (req, res, next) {
    res.result = new Result();
    var table = 'api';
    var query = "name='" + req.params.api + "'";

    var data = MDBconnect().deleteData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute putapi POST Success', { _id: data });
    };
}

//tag api
, getalltag = function (req, res, next) {
    res.result = new Result();
    var table = 'tag';
    var query = req.query.q || '';
    var data = MDBconnect().pageData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute getalltag GET Success', data);
    };
}
, gettag = function (req, res, next) {
    res.result = new Result();
    var table = 'tag';
    var query = req.query.q || '';
    var data = MDBconnect().pageData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute gettag GET Success', data);
    };
}
, posttag = function (req, res, next) {
    res.result = new Result();
    var table = 'tag';
    var info = req.body || '';

    var data = MDBconnect().postData(table, info);

    if (data) {
        res.result.response(next, 1, 'APIRoute posttag POST Success', { _id: data });
    };
}
, puttag = function (req, res, next) {
    res.result = new Result();
    var table = 'tag';
    var query = req.query.q || '';

    var data = MDBconnect().putData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute puttag POST Success', { _id: data });
    };
}
, deltag = function (req, res, next) {
    res.result = new Result();
    var table = 'tag';
    var query = req.query.q || '';

    var data = MDBconnect().deleteData(table, query);

    if (data) {
        res.result.response(next, 1, 'APIRoute deltag POST Success', { _id: data });
    };
}


, apiRoute = function (req, res, next) {
    res.result = new Result();

    var routeURL = url.parse(req.originalUrl).pathname;
    var method = req.method;
    var app = req.params.app;
    var api = req.params.api;

    switch (method) {
        case 'GET':
            if (!api && !app) {
                getallapp(req, res, next);
            };
            if (!api && app) {
                getappapi(req, res, next);
            };
            if (api && app) {
                getappapiinfo(req, res, next);
            };
            break;
        case 'POST':
            if (!api && app) {
                postapp(req, res, next);
            };
            if (api && app) {
                postapi(req, res, next);
            };
            break;
        case 'PUT':
            if (!api && app) {
                putapp(req, res, next);
            };
            if (api && app) {
                putapi(req, res, next);
            };
            break;
        case 'DELETE':
            if (!api && app) {
                delapp(req, res, next);
            };
            if (api && app) {
                delapi(req, res, next);
            };
            break;
    };
}
, tagRoute = function (req, res, next) {
    res.result = new Result();

    var routeURL = url.parse(req.originalUrl).pathname;
    var method = req.method;
    var tag = req.params.tag;

    switch (method) {
        case 'GET':
            if (!tag) {
                getalltag(req, res, next);
            } else {
                gettag(req, res, next);
            };
            break;
        case 'POST':
            if (tag) {
                posttag(req, res, next);
            };
            break;
        case 'PUT':
            if (tag) {
                puttag(req, res, next);
            };
            break;
        case 'DELETE':
            if (tag) {
                deltag(req, res, next);
            };
            break;
    };
}

, init = function (_config, _logger, route) {
    config = _config;
    logger = _logger;
    DB = {};

    // EasyDB
    route.all('/manage/db/', dbRoute);
    route.all('/manage/db/:table', dbRoute);
    route.all('/manage/db/:table/:id', dbRoute);

    //managerAPI
    route.all('/manage/api/', apiRoute); //show all app
    route.all('/manage/api/:app', apiRoute); //show app's api
    route.all('/manage/api/:app/:api', apiRoute); //show the api info

    route.all('/manage/tag/', tagRoute); //show all tag
    route.all('/manage/tag/:tag', tagRoute); //show tag's info

}
;

module.exports = {
    init: init
}
;