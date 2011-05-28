var sys = require('sys'),
    _ = require('underscore');

var Util = {
  convertObjectKeysToUnderscores: function (obj) {
    var newObj = {};
    _.each(obj, function (value, key) {
      if (typeof(value) === 'object') {
        newObj[Util.toUnderscore(key)] = Util.convertObjectKeysToUnderscores(value);
      }
      else {
        newObj[Util.toUnderscore(key)] = value;
      }
    });
    return newObj;
  },

  toCamelCase: function (string) {
    return string.replace(/(\-[a-z0-9])/g, function ($1) { return $1.toUpperCase().replace('-',''); } );
  },

  toUnderscore: function (string) {
    return string.replace(/([A-Z])/g, function ($1) { return "_" + $1.toLowerCase(); } );
  }
};


exports.Util = Util;
