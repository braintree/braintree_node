"use strict";

const errorTypes = {
  authenticationError: "authenticationError",
  authorizationError: "authorizationError",
  gatewayTimeoutError: "gatewayTimeoutError",
  invalidChallengeError: "invalidChallengeError",
  invalidKeysError: "invalidKeysError",
  invalidSignatureError: "invalidSignatureError",
  notFoundError: "notFoundError",
  requestTimeoutError: "requestTimeoutError",
  serverError: "serverError",
  serviceUnavailableError: "serviceUnavailableError",
  testOperationPerformedInProductionError:
    "testOperationPerformedInProductionError",
  tooManyRequestsError: "tooManyRequestsError",
  unexpectedError: "unexpectedError",
  upgradeRequired: "upgradeRequired",
};

module.exports = {
  errorTypes: errorTypes,
};
