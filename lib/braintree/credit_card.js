var _ = require('underscore')._;

var CreditCard = function (attributes) {
  var that = {};
  _.each(attributes, function (val, key) {
    that[key] = val;
  });
  that.maskedNumber = that.bin + '******' + that.last4;
  that.expirationDate = that.expirationMonth + '/' + that.expirationYear;

  return that;
};

exports.CreditCard = CreditCard;
