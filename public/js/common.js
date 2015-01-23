'use strict';

var displayByte = function(byte, unit) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'DB', 'NB'];
    var number = parseInt(byte)
    ,   rs = 0
    ,   index = 0;

    while(number > 1000) {
        number = number / 1000;
        index ++;
    }

    rs = parseInt(number * 100) / 100;

    return [rs, units[index]];
};