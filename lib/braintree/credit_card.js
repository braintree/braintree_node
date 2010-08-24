var _ = require('underscore')._;

var CreditCard = function (attributes) {
  var that = {};
  _.each(attributes, function (val, key) {
    that[key] = val;
  });
  that.maskedNumber = that.bin + '******' + that.last4;

  return that;
};

exports.CreditCard = CreditCard;
