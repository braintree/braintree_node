var Transaction = require('./transaction').Transaction,
    ErrorResponse = require('./error_response').ErrorResponse;

var TransactionGateway = function(gateway) {
  var my = {
    gateway: gateway
  };

  var create = function(attributes, callback) {
    my.gateway.http.post('/transactions', {transaction: attributes}, function (err, response) {
      if (err) return callback(err, response);

      if (response.transaction) {
        response.success = true;
        response.transaction = Transaction(response.transaction);
        callback(null, response);
      }
      else if (response.apiErrorResponse) {
        callback(null, ErrorResponse(response.apiErrorResponse));
      }
      else {
        // shouldn't happen
      }
    });
  };

  return {
    sale: function(attributes, callback) {
      attributes.type = 'sale';
      return create(attributes, callback);
    }
  };
};

exports.TransactionGateway = TransactionGateway;
