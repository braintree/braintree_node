var errorTypes = require('./error_types');

var InvalidTransparentRedirectHashError = function() {
  return {
    message: 'The transparent redirect hash is invalid.',
    type: errorTypes.invalidTransparentRedirectHashError
  };
};

exports.InvalidTransparentRedirectHashError = InvalidTransparentRedirectHashError;
