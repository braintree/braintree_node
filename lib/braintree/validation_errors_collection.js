var _ = require('underscore')._,
    ValidationError = require('./validation_error').ValidationError;

var ValidationErrorsCollection = function (errorAttributes) {
  var my = {
    validationErrors: {},
    errorCollections: {}
  };

  var buildErrors = function (errors) {
    _.each(errors, function (item) {
      my.validationErrors[toCamel(item.attribute)] = ValidationError(item);
    });
  };

  var toCamel = function (word) {
    return word.replace(/(\_[a-z])/g, function($1) {
      return $1.toUpperCase().replace('_','');
    });
  };

  _.each(errorAttributes, function (val, key) {
    if (key === 'errors') {
      buildErrors(val);
    } else {
      my.errorCollections[key] = ValidationErrorsCollection(val);
    }
  });

  return {
    deepErrors: function () {
      var deepErrors = [];
      _.each(my.validationErrors, function (val, key) {
        deepErrors.push(val);
      });

      _.each(my.errorCollections, function (val, key) {
        deepErrors = deepErrors.concat(val.deepErrors());
      });

      return deepErrors;
    },

    for: function (name) {
      return my.errorCollections[name];
    },

    on: function (name) {
      return my.validationErrors[name];
    }
  };
};

exports.ValidationErrorsCollection = ValidationErrorsCollection;
