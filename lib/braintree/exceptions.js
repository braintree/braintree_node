var errorTypes = require('./error_types');

var AuthenticationError = function() {
  return {
    message: 'Authentication Error',
    type: errorTypes.authenticationError
  };
};

var DownForMaintenanceError = function() {
  return {
    message: 'Down for Maintenance',
    type: errorTypes.downForMaintenanceError
  };
};

var InvalidTransparentRedirectHashError = function() {
  return {
    message: 'The transparent redirect hash is invalid.',
    type: errorTypes.invalidTransparentRedirectHashError
  };
};

var NotFoundError = function() {
  return {
    message: 'Not Found',
    type: errorTypes.notFoundError
  };
};

var ServerError = function() {
  return {
    message: 'Server Error',
    type: errorTypes.serverError
  };
};

var UnexpectedError = function (message) {
  return {
    message: message,
    type: errorTypes.unexpectedError
  };
};

exports.AuthenticationError = AuthenticationError;
exports.DownForMaintenanceError = DownForMaintenanceError;
exports.InvalidTransparentRedirectHashError = InvalidTransparentRedirectHashError;
exports.NotFoundError = NotFoundError;
exports.ServerError = ServerError;
exports.UnexpectedError = UnexpectedError;
