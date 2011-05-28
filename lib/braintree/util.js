var sys = require('sys');

var Util = {
  toCamelCase: function (string) {
    return string.replace(/(\-[a-z0-9])/g, function($1) { return $1.toUpperCase().replace('-',''); } );
  }
};


exports.Util = Util;
