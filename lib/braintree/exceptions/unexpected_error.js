var errorTypes = require('./error_types');

var UnexpectedError = function (message) {
  return {
    message: message,
    type: errorTypes.unexpectedError
  };
};

exports.UnexpectedError = UnexpectedError;
