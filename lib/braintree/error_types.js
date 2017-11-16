'use strict';

const errorTypes = {
  authenticationError: 'authenticationError',
  authorizationError: 'authorizationError',
  downForMaintenanceError: 'downForMaintenanceError',
  invalidSignatureError: 'invalidSignatureError',
  invalidChallengeError: 'invalidChallengeError',
  invalidTransparentRedirectHashError: 'invalidTransparentRedirectHashError',
  notFoundError: 'notFoundError',
  serverError: 'serverError',
  testOperationPerformedInProductionError: 'testOperationPerformedInProductionError',
  tooManyRequestsError: 'tooManyRequestsError',
  unexpectedError: 'unexpectedError',
  invalidKeysError: 'invalidKeysError',
  upgradeRequired: 'upgradeRequired'
};

module.exports = {
  errorTypes: errorTypes
};
