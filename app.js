'use strict';

const moment = require('moment'); // time date

var Singleton = (function () {
    var instance;
 
    function createInstance() {
        var obj = new Object("I am the instance");
        obj.dt = function() {
            return moment().format("YYYY-MM-DD HH:mm:ss");
        };
        obj.dd = function() {
            return `[ ${moment().format("YYYY-MM-DD HH:mm:ss")} ] `;
        };
        return obj;
    }
 
    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        },
    };
})();

module.exports = Singleton;