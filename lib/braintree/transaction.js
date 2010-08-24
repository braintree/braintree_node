var _ = require('underscore')._,
    CreditCard = require('./credit_card').CreditCard;

var Transaction = function (attributes) {
  var that = {};
  _.each(attributes, function (val, key) {
    that[key] = val;
  });
  that.creditCard = CreditCard(that.creditCard);

  return that;
};

exports.Transaction = Transaction;
