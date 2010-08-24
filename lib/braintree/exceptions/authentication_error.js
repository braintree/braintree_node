var errorTypes = require('./error_types');

var AuthenticationError = function() {
  return {
    message: 'Authentication Error',
    type: errorTypes.authenticationError
  };
};

exports.AuthenticationError = AuthenticationError;
