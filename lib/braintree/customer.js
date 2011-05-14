var _ = require('underscore')._,
    CreditCard = require('./credit_card').CreditCard;

var Customer = function (attributes) {
  var that = {};
  _.each(attributes, function (val, key) {
    that[key] = val;
  });
  that.creditCards = _.map(that.creditCards, function (cardAttributes) {
    return CreditCard(cardAttributes.creditCard);
  });

  return that;
};

exports.Customer = Customer;
