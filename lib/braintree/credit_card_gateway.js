var CreditCard = require('./credit_card').CreditCard,
    ErrorResponse = require('./error_response').ErrorResponse;

var CreditCardGateway = function (gateway) {
  var my = {
    gateway: gateway
  };

  var create = function (attributes, callback) {
    my.gateway.http.post('/payment_methods', {creditCard: attributes}, responseHandler(callback));
  };

  var destroy = function (token, callback) {
    my.gateway.http.delete('/payment_methods/' + token, callback);
  };

  var find = function (token, callback) {
    var callback = callback;
    my.gateway.http.get('/payment_methods/' + token, function(err, response) {
      if (err) { return callback(err, null); }
      callback(null, CreditCard(response.creditCard));
    });
  };

  var update = function (token, attributes, callback) {
    my.gateway.http.put(
      '/payment_methods/' + token,
      {creditCard: attributes},
      responseHandler(callback)
    );
  }

  var responseHandler = function (callback) {
    return function (err, response) {
      if (err) return callback(err, response);

      if (response.creditCard) {
        response.success = true;
        response.creditCard = CreditCard(response.creditCard);
        callback(null, response);
      }
      else if (response.apiErrorResponse) {
        callback(null, ErrorResponse(response.apiErrorResponse));
      }
      else {
        // shouldn't happen
      }
    }
  };

  return {
    create: create,
    delete: destroy,
    find: find,
    update: update
  }
};

exports.CreditCardGateway = CreditCardGateway;;

