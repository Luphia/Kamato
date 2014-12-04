// opt => {channel,room, socket, io}

// fnc =>  joinroom,
//         leaveroom,
//         changeroom,
//         watchallroom,
//         watchoneroom,
//         sID,

module.exports = function (opt) {
    var init = function (opt) {
        this.io = opt.io || null;
        this.channel = opt.channel || 'default';
        this.room = opt.room || 'default';
        this.socket = opt.socket || null;
        return this;
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

    //watch all room list from socket.io namespace
    var watchallroom = function () {
        var io = this.io;
        var socket = this.socket;
        var name = io.sockets.name;
        return io.nsps[name].adapter.rooms;
    };

    //watch one room list from socket.io namespace
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

    var channel = {
        init: init,
        joinroom: joinroom,
        leaveroom: leaveroom,
        changeroom: changeroom,
        watchallroom: watchallroom,
        watchoneroom: watchoneroom,
        sID: sID
    };

    return channel.init(opt);
}
