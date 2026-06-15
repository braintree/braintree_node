"use strict";

let {
  AuthenticationIds,
} = require("../../../lib/braintree/test_values/authentication_ids");

describe("AuthenticationIds", () => {
  it("exports AuthenticationIds object", function () {
    assert.exists(AuthenticationIds);
    assert.isObject(AuthenticationIds);
  });

  describe("Three D Secure Visa", () => {
    it("has ThreeDSecureVisaFullAuthentication value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaFullAuthentication,
        "fake-three-d-secure-visa-full-authentication-id"
      );
    });

    it("has ThreeDSecureVisaLookupTimeout value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaLookupTimeout,
        "fake-three-d-secure-visa-lookup-timeout-id"
      );
    });

    it("has ThreeDSecureVisaFailedSignature value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaFailedSignature,
        "fake-three-d-secure-visa-failed-signature-id"
      );
    });

    it("has ThreeDSecureVisaFailedAuthentication value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaFailedAuthentication,
        "fake-three-d-secure-visa-failed-authentication-id"
      );
    });

    it("has ThreeDSecureVisaAttemptsNonParticipating value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaAttemptsNonParticipating,
        "fake-three-d-secure-visa-attempts-non-participating-id"
      );
    });

    it("has ThreeDSecureVisaNoteEnrolled value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaNoteEnrolled,
        "fake-three-d-secure-visa-not-enrolled-id"
      );
    });

    it("has ThreeDSecureVisaUnavailable value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaUnavailable,
        "fake-three-d-secure-visa-unavailable-id"
      );
    });

    it("has ThreeDSecureVisaMPILookupError value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaMPILookupError,
        "fake-three-d-secure-visa-mpi-lookup-error-id"
      );
    });

    it("has ThreeDSecureVisaMPIAuthenticateError value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaMPIAuthenticateError,
        "fake-three-d-secure-visa-mpi-authenticate-error-id"
      );
    });

    it("has ThreeDSecureVisaAuthenticationUnavailable value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaAuthenticationUnavailable,
        "fake-three-d-secure-visa-authentication-unavailable-id"
      );
    });

    it("has ThreeDSecureVisaBypassedAuthentication value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureVisaBypassedAuthentication,
        "fake-three-d-secure-visa-bypassed-authentication-id"
      );
    });
  });

  describe("Three D Secure Two Visa", () => {
    it("has ThreeDSecureTwoVisaSuccessfulFrictionlessAuthentication value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureTwoVisaSuccessfulFrictionlessAuthentication,
        "fake-three-d-secure-two-visa-successful-frictionless-authentication-id"
      );
    });

    it("has ThreeDSecureTwoVisaSuccessfulStepUpAuthentication value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureTwoVisaSuccessfulStepUpAuthentication,
        "fake-three-d-secure-two-visa-successful-step-up-authentication-id"
      );
    });

    it("has ThreeDSecureTwoVisaErrorOnLookup value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureTwoVisaErrorOnLookup,
        "fake-three-d-secure-two-visa-error-on-lookup-id"
      );
    });

    it("has ThreeDSecureTwoVisaTimeoutOnLookup value", function () {
      assert.equal(
        AuthenticationIds.ThreeDSecureTwoVisaTimeoutOnLookup,
        "fake-three-d-secure-two-visa-timeout-on-lookup-id"
      );
    });
  });

  it("has 15 authentication ID values", function () {
    let keys = Object.keys(AuthenticationIds);

    assert.equal(keys.length, 15);
  });

  it("all values are strings", function () {
    let keys = Object.keys(AuthenticationIds);

    keys.forEach((key) => {
      assert.isString(AuthenticationIds[key], `${key} should be a string`);
    });
  });

  it("all values contain 'fake-' prefix", function () {
    let keys = Object.keys(AuthenticationIds);

    keys.forEach((key) => {
      assert.match(
        AuthenticationIds[key],
        /^fake-/,
        `${key} value should start with 'fake-'`
      );
    });
  });
});
