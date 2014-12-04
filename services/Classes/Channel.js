﻿// opt => {channel,room, socket, io, auto:t/f}

// fnc =>  joinroom(room, cb),
//         leaveroom(room, cb),
//         changeroom(room, cb),
//         watchallroom,
//         watchoneroom(room),
//         sID,
//         FileBOT(base64, kind, cb)

var fs = require('fs');

module.exports = function (opt) {
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
    function base64_decode(base64str, file) {
        var f = new Buffer(base64str, 'base64');
        fs.writeFileSync(file, f);
    };
    var FileBOT = function (base64, kind, cb) {
        base64_decode(base64, './files/' + kind);
    };

    var channel = {
        init: init,
        joinroom: joinroom,
        leaveroom: leaveroom,
        changeroom: changeroom,
        watchallroom: watchallroom,
        watchoneroom: watchoneroom,
        sID: sID,
        FileBOT: FileBOT
    };

    return channel.init(opt);
};