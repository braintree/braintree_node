GLOBAL.sys = require('sys');
GLOBAL.vows = require('vows');
GLOBAL.assert = require('assert');

GLOBAL.inspect = function (object) {
  sys.puts(sys.inspect(object));
};
