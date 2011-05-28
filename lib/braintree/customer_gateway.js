var Customer = require('./customer').Customer,
    ErrorResponse = require('./error_response').ErrorResponse;

var CustomerGateway = function(gateway) {
  var my = {
    gateway: gateway
  };

  var create = function (attributes, callback) {
    my.gateway.http.post('/customers', {customer: attributes}, responseHandler(callback));
  };

  var destroy = function (customer_id, callback) {
    my.gateway.http.delete('/customers/' + customer_id, callback);
  };

  var find = function (customer_id, callback) {
    var callback = callback;
    my.gateway.http.get('/customers/' + customer_id, function(err, response) {
      if (err) { return callback(err, null); }
      callback(null, Customer(response.customer));
    });
  };

  var update = function (customer_id, attributes, callback) {
    my.gateway.http.put(
      '/customers/' + customer_id,
      {customer: attributes},
      responseHandler(callback)
    );
  }

  var responseHandler = function (callback) {
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
    delete: destroy,
    find: find,
    responseHandler: responseHandler,
    update: update
  };
};

exports.CustomerGateway = CustomerGateway;

