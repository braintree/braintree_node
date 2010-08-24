var ValidationError = function (error) {
  return {
    attribute: error.attribute,
    code: error.code,
    message: error.message
  };
};

exports.ValidationError = ValidationError;
