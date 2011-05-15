var Subscription = require('./subscription').Subscription,
    ErrorResponse = require('./error_response').ErrorResponse;

var SubscriptionGateway = function(gateway) {
  var my = {
    gateway: gateway
  };

  var create = function(attributes, callback) {
    my.gateway.http.post('/subscriptions', {subscription: attributes}, responseHandler(callback));
  };

  var responseHandler = function(callback) {
    return function (err, response) {
      if (err) return callback(err, response);

      if (response.subscription) {
        response.success = true;
        response.subscription = Subscription(response.subscription);
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
    create: create
  };
};

exports.SubscriptionGateway = SubscriptionGateway;

