var Subscription = require('./subscription').Subscription,
    ErrorResponse = require('./error_response').ErrorResponse;

var SubscriptionGateway = function (gateway) {
  var my = {
    gateway: gateway
  };

  var create = function (attributes, callback) {
    my.gateway.http.post('/subscriptions', {subscription: attributes}, responseHandler(callback));
  };

  var cancel = function (subscription_id, callback) {
    my.gateway.http.put('/subscriptions/' + subscription_id + '/cancel', null, responseHandler(callback));
  };

  var find = function (subscription_id, callback) {
    var callback = callback;
    my.gateway.http.get('/subscriptions/' + subscription_id, function (err, response) {
      if (err) { return callback(err, null); }
      callback(null, Subscription(response.subscription));
    });
  };

  var responseHandler = function (callback) {
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
    cancel: cancel,
    create: create,
    find: find
  };
};

exports.SubscriptionGateway = SubscriptionGateway;

