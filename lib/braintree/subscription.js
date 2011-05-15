var _ = require('underscore')._;

var Subscription = function (attributes) {
  var that = {};
  _.each(attributes, function (val, key) {
    that[key] = val;
  });

  return that;
};

exports.Subscription = Subscription;
