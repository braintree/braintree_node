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
  GatewayTimeoutError: errorMaker(errorTypes.gatewayTimeoutError),
  InvalidChallengeError: errorMaker(errorTypes.invalidChallengeError),
  InvalidKeysError: errorMaker(errorTypes.invalidKeysError),
  InvalidSignatureError: errorMaker(errorTypes.invalidSignatureError),
  NotFoundError: errorMaker(errorTypes.notFoundError),
  RequestTimeoutError: errorMaker(errorTypes.requestTimeoutError),
  ServerError: errorMaker(errorTypes.serverError),
  ServiceUnavailableError: errorMaker(errorTypes.serviceUnavailableError),
  TestOperationPerformedInProductionError: errorMaker(errorTypes.testOperationPerformedInProductionError),
  TooManyRequestsError: errorMaker(errorTypes.tooManyRequestsError),
  UnexpectedError: errorMaker(errorTypes.unexpectedError),
  UpgradeRequired: errorMaker(errorTypes.upgradeRequired)
};
