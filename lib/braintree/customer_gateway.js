var Customer = require('./customer').Customer,
    ErrorResponse = require('./error_response').ErrorResponse;

var CustomerGateway = function(gateway) {
  var my = {
    gateway: gateway
  };

  var create = function(attributes, callback) {
    my.gateway.http.post('/customers', {customer: attributes}, responseHandler(callback));
  };

  var find = function(customer_id, callback) {
    var callback = callback;
    my.gateway.http.get('/customers/' + customer_id, function(err, response) {
      if (err) { return callback(err, null); }
      callback(null, Customer(response.customer));
    });
  };

  var responseHandler = function(callback) {
    return function (err, response) {
      if (err) return callback(err, response);

      if (response.customer) {
        response.success = true;
        response.customer = Customer(response.customer);
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
    find: find
  }
};

exports.CustomerGateway = CustomerGateway;

