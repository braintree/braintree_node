'use strict';

let errorTypes = require('./error_types').errorTypes;

function errorMaker(type) {
  return function (message) {
    let err = new Error(message || '');

    err.type = err.name = type;

    return err;
  };
}

module.exports = {
  AuthenticationError: errorMaker(errorTypes.authenticationError),
  AuthorizationError: errorMaker(errorTypes.authorizationError),
  DownForMaintenanceError: errorMaker(errorTypes.downForMaintenanceError),
  InvalidSignatureError: errorMaker(errorTypes.invalidSignatureError),
  InvalidChallengeError: errorMaker(errorTypes.invalidChallengeError),
  InvalidTransparentRedirectHashError: errorMaker(errorTypes.invalidTransparentRedirectHashError),
  NotFoundError: errorMaker(errorTypes.notFoundError),
  ServerError: errorMaker(errorTypes.serverError),
  TestOperationPerformedInProductionError: errorMaker(errorTypes.testOperationPerformedInProductionError),
  TooManyRequestsError: errorMaker(errorTypes.tooManyRequestsError),
  UnexpectedError: errorMaker(errorTypes.unexpectedError),
  InvalidKeysError: errorMaker(errorTypes.invalidKeysError),
  UpgradeRequired: errorMaker(errorTypes.upgradeRequired)
};
