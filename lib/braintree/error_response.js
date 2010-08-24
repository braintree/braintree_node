var ValidationErrorsCollection = require('./validation_errors_collection').ValidationErrorsCollection,
    Transaction = require('./transaction').Transaction;

var ErrorResponse = function (attributes) {
  var that = {};
  _.each(attributes, function (val, key) {
    that[key] = val;
  });
  that.success = false;
  that.errors = ValidationErrorsCollection(that.errors);
  if (that.transaction) that.transaction = Transaction(that.transaction);

  return that;
};

exports.ErrorResponse = ErrorResponse;
