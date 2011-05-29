var errorTypes = require('./error_types');

var AuthenticationError = function () {
  return {
    message: 'Authentication Error',
    type: errorTypes.authenticationError
  };
};

var AuthorizationError = function () {
  return {
    message: 'Authorization Error',
    type: errorTypes.authorizationError
  };
};

var DownForMaintenanceError = function () {
  return {
    message: 'Down for Maintenance',
    type: errorTypes.downForMaintenanceError
  };
};

var InvalidTransparentRedirectHashError = function () {
  return {
    message: 'The transparent redirect hash is invalid.',
    type: errorTypes.invalidTransparentRedirectHashError
  };
};

var NotFoundError = function () {
  return {
    message: 'Not Found',
    type: errorTypes.notFoundError
  };
};

var ServerError = function () {
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

var UpgradeRequired = function () {
  return {
    message: 'This version of the node library is no longer supported.',
    type: errorTypes.upgradeRequired
  };
};

exports.AuthenticationError = AuthenticationError;
exports.AuthorizationError = AuthorizationError;
exports.DownForMaintenanceError = DownForMaintenanceError;
exports.InvalidTransparentRedirectHashError = InvalidTransparentRedirectHashError;
exports.NotFoundError = NotFoundError;
exports.ServerError = ServerError;
exports.UnexpectedError = UnexpectedError;
exports.UpgradeRequired = UpgradeRequired;
