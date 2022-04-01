"use strict";

let Environment = require("../../../lib/braintree/environment").Environment;

describe("Environment", () =>
  describe("baseUrl", function () {
    it("generates a base url with proper scheme and port", function () {
      let env = new Environment(
        "test.domain",
        "3001",
        "http://auth.venmo.dev",
        false
      );

      assert.equal("http://test.domain", env.baseUrl());
    });

    it("uses https if ssl is true", function () {
      let env = new Environment(
        "test.domain",
        "3001",
        "http://auth.venmo.dev",
        true
      );

      assert.equal("https://test.domain", env.baseUrl());
    });

    // as part of the CI build, we replace this base URL with the
    // URL that works in the backend system powering CI. Unfortunately
    // this process changes the length of the file, and prettier will
    // fail the line, so we have a pre-emptive ignore here to stop it
    // from failing the build because the line is too long
    // prettier-ignore
    it("includes the port for the Development environment", function () {
      let baseUrl = `http://localhost:${process.env.GATEWAY_PORT || "3000"}`;

      assert.equal(baseUrl, Environment.Development.baseUrl());
    });
  }));
