'use strict';

require('../../spec_helper');
let Environment = require('../../../lib/braintree/environment').Environment;

describe("Environment", () =>
  describe("baseUrl", function() {
    it("generates a base url with proper scheme and port", function() {
      let env = new Environment(
        'test.domain',
        '3001',
        'http://auth.venmo.dev',
        false
      );
      return assert.equal("http://test.domain", env.baseUrl());
    });

    it("uses https if ssl is true", function() {
      let env = new Environment(
        'test.domain',
        '3001',
        'http://auth.venmo.dev',
        true
      );
      return assert.equal("https://test.domain", env.baseUrl());
    });

    return it("includes the port for the Development environment", function() {
      let baseUrl = `http://localhost:${process.env['GATEWAY_PORT'] || '3000'}`;
      return assert.equal(baseUrl, Environment.Development.baseUrl());
    });
  })
);
