﻿// opt => {channel, room, socket, io, auto:t/f}

// fnc =>  joinroom(room, cb),
//         leaveroom(room, cb),
//         changeroom(room, cb),
//         watchallroom,
//         watchoneroom(room),
//         sID,
//         FileBOT(data, cb)             => data={Id, body, kind }
//         EncryptBOT(data, cb)          => data={Id, method, body}
//         MailBOT(data, cb)             => data={Id, title, mailto, ccto, content}

var fs = require('fs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

module.exports = function (opt, Mailconfig) {
    var Fileconfig = {
        folder: './files/'
    };
    // setup MailBOT SMTP transport
    var transporter = nodemailer.createTransport(Mailconfig);

    var init = function (opt) {
        this.io = opt.io || null;
        this.channel = opt.channel || null;
        this.room = opt.room || 'default';
        this.socket = opt.socket || null;
        if (opt.auto == true) {
            return auto(this);
        } else {
            return this;
        };
    };

    //start
    var auto = function (object) {
        var socket = object.socket;
        var room = object.room;
        socket.join(room);
        return object;
    };

    //join room
    var joinroom = function (room, cb) {
        var socket = this.socket;
        socket.join(room, function () {
            cb(true);
        });
    };

    //leave room
    var leaveroom = function (room, cb) {
        var socket = this.socket;
        socket.leave(room, function () {
            cb(true);
        });
    };

    //change room will leave old room first
    var changeroom = function (room, cb) {
        var socket = this.socket;
        var oldroom = this.room;
        var newroom = room;
        socket.leave(oldroom, function () {
            socket.join(newroom, function () {
                cb(true);
            });
        });
    };

    //watch all room and users list from socket.io namespace
    var watchallroom = function () {
        var io = this.io;
        var socket = this.socket;
        var name = io.sockets.name;
        return io.nsps[name].adapter.rooms;
    };

    //watch one room and users list from socket.io namespace
    var watchoneroom = function (room) {
        var io = this.io;
        var socket = this.socket;
        var name = io.sockets.name;
        return io.nsps[name].adapter.rooms[room];
    };

    //watch the sessionID from socket.io
    var sID = function () {
        var socket = this.socket;
        return socket.handshake.sessionID;
    };

    //File System BOT Fnc
    function base64_encode(file) {
        var f = fs.readFileSync(file);
        return new Buffer(f).toString('base64');
    };
    function base64_decode(base64str, file, cb) {
        var f = new Buffer(base64str, 'base64');
        fs.writeFile(file, f, function (error) {
            if (error) {
                cb({ result: 0, info: file });
            } else {
                cb({ result: 1, info: file });
            };
        });
    };
    var FileBOT = function (data, cb) {
        var Id = data.Id;
        var body = data.body;
        var kind = data.kind;
        base64_decode(body, Fileconfig.folder + kind, function (data) {
            data['Id'] = Id;
            data['response'] = 'FileBOT';
            cb(data);
        });
    };

    //Encrypt BOT Fnc
    var EncryptBOT = function (data, cb) {
        var Id = data.Id;
        var method = data.method || 'MD5';
        var encrypt = data.encrypt;
        var body = data.body;
        var response = 'EncryptBOT';

        if (typeof encrypt == 'undefined') {
            switch (method) {
                case 'MD5':
                    data.body = crypto.createHash('md5').update(body).digest('hex');
                    data['encrypt'] = 'MD5';
                    data['result'] = 1;
                    data['info'] = '';
                    break;
                case 'SHA1':
                    data.body = crypto.createHash('sha1').update(body).digest('hex');
                    data['encrypt'] = 'SHA1';
                    data['result'] = 1;
                    data['info'] = '';
                    break;
            };
            data['response'] = response;
            delete data.method;
            cb(data);
        } else {
            //decrypt
        };
    };

    //Mail BOT Fnc
    var MailBOT = function (data, cb) {
        var Id = data.Id;
        var mailto = data.mailto;
        var content = data.content;
        var response = 'MailBOT';
        var title = data.title || null;
        var ccto = data.ccto || null;

        var Mailopt = {
            from: Mailconfig.auth.from, // sender address
            to: mailto, // list of receivers
            cc: ccto, // list of receivers
            subject: title, // Subject line
            html: content, // html body
        };

        // send mail with defined transport object
        transporter.sendMail(Mailopt, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            };
        });

    };


    var channel = {
        init: init,
        joinroom: joinroom,
        leaveroom: leaveroom,
        changeroom: changeroom,
        watchallroom: watchallroom,
        watchoneroom: watchoneroom,
        sID: sID,
        FileBOT: FileBOT,
        EncryptBOT: EncryptBOT,
        MailBOT: MailBOT
    };

    return channel.init(opt);
};