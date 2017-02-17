'use strict';

require("../spec_helper");
let Config = require('../../lib/braintree/config').Config;
let Environment = require('../../lib/braintree/environment').Environment;

describe("Config", function() {
  it("can be configured with merchant credentials", function() {
    let config = new Config({
      merchantId: 'merchantId',
      publicKey: 'publicKey',
      privateKey: 'privateKey',
      environment: 'development'
    });

    assert.equal(config.merchantId, 'merchantId');
    assert.equal(config.publicKey, 'publicKey');
    return assert.equal(config.privateKey, 'privateKey');
  });

  it("can be configured with partner credentials", function() {
    let config = new Config({
      partnerId: 'partnerId',
      publicKey: 'publicKey',
      privateKey: 'privateKey',
      environment: 'development'
    });

    assert.equal(config.merchantId, 'partnerId');
    assert.equal(config.publicKey, 'publicKey');
    return assert.equal(config.privateKey, 'privateKey');
  });

  it("raises an exception if merchantId is null", () =>
    assert.throws(function() {
      let config;
      return config = new Config({
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: 'development'
      });
    }
    , 'Missing merchantId')
  );

  it("raises an exception if merchantId is empty", () =>
    assert.throws(function() {
      let config;
      return config = new Config({
        merchantId: '',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: 'development'
      });
    }
    , 'Missing merchantId')
  );

  it("raises an exception if publicKey is null", () =>
    assert.throws(function() {
      let config;
      return config = new Config({
        merchantId: 'merchantId',
        privateKey: 'privateKey',
        environment: 'development'
      });
    }
    , 'Missing publicKey')
  );

  it("raises an exception if publicKey is empty", () =>
    assert.throws(function() {
      let config;
      return config = new Config({
        merchantId: 'merchantId',
        publicKey: '',
        privateKey: 'privateKey',
        environment: 'development'
      });
    }
    , 'Missing publicKey')
  );

  it("raises an exception if privateKey is null", () =>
    assert.throws(function() {
      let config;
      return config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        environment: 'development'
      });
    }
    , 'Missing privateKey')
  );

  it("raises an exception if privateKey is empty", () =>
    assert.throws(function() {
      let config;
      return config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: '',
        environment: 'development'
      });
    }
    , 'Missing privateKey')
  );

  it("raises an exception if environment is null", () =>
    assert.throws(function() {
      let config;
      return config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey'
      });
    }
    , 'Missing environment')
  );

  it("raises an exception if environment is empty", () =>
    assert.throws(function() {
      let config;
      return config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: ''
      });
    }
    , 'Missing environment')
  );

  describe("baseMerchantUrl", () =>
    it("returns the url for a merchant", function() {
      let config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: new Environment('localhost', 3000, false)
      });

      return assert.equal(config.baseMerchantUrl(), "http://localhost/merchants/merchantId");
    })
  );

  return describe("timeout", () =>
    it("defaults to 60 seconds", function() {
      let config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: 'development'
      });

      return assert.equal(config.timeout, 60000);
    })
  );
});
