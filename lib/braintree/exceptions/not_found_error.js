var errorTypes = require('./error_types');

var NotFoundError = function() {
  return {
    message: 'Not Found',
    type: errorTypes.notFoundError
  };
};

exports.NotFoundError = NotFoundError;
