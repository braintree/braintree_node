var Transaction = require('./transaction').Transaction,
    ErrorResponse = require('./error_response').ErrorResponse;

var TransactionGateway = function(gateway) {
  var my = {
    gateway: gateway
  };

  var create = function(attributes, callback) {
    my.gateway.http.post('/transactions', {transaction: attributes}, responseHandler(callback));
  };

  var responseHandler = function(callback) {
    return function (err, response) {
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
    }
  };

  return {
    sale: function (attributes, callback) {
      attributes.type = 'sale';
      return create(attributes, callback);
    },

    submitForSettlement: function (transaction_id, callback) {
      my.gateway.http.put('/transactions/' + transaction_id + '/submit_for_settlement', null, responseHandler(callback));
    },

    void: function (transaction_id, callback) {
      my.gateway.http.put('/transactions/' + transaction_id + '/void', null, responseHandler(callback));
    }
  };
};

exports.TransactionGateway = TransactionGateway;
