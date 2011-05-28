var errorTypes = require('./error_types');

var ServerError = function() {
  return {
    message: 'Server Error',
    type: errorTypes.serverError
  };
};

exports.ServerError = ServerError;
