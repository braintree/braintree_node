var _ = require('underscore')._;

var Customer = function (attributes) {
  var that = {};
  _.each(attributes, function (val, key) {
    that[key] = val;
  });

  return that;
};

exports.Customer = Customer;
