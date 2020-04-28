'use strict';
/* eslint-disable no-new */

let Config = require('../../lib/braintree/config').Config;
let Environment = require('../../lib/braintree/environment').Environment;
let sinon = require('sinon');

describe('Config', function () {
  it('can be configured with merchant credentials', function () {
    let config = new Config({
      merchantId: 'merchantId',
      publicKey: 'publicKey',
      privateKey: 'privateKey',
      environment: 'development'
    });

    assert.equal(config.merchantId, 'merchantId');
    assert.equal(config.publicKey, 'publicKey');
    assert.equal(config.privateKey, 'privateKey');
  });

  it('can be configured with partner credentials', function () {
    let config = new Config({
      partnerId: 'partnerId',
      publicKey: 'publicKey',
      privateKey: 'privateKey',
      environment: 'development'
    });

    assert.equal(config.merchantId, 'partnerId');
    assert.equal(config.publicKey, 'publicKey');
    assert.equal(config.privateKey, 'privateKey');
  });

  it('raises an exception if merchantId is null', () =>
    assert.throws(function () {
      new Config({
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: 'development'
      });
    }
      , 'Missing merchantId')
  );

  it('raises an exception if merchantId is empty', () =>
    assert.throws(function () {
      new Config({
        merchantId: '',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: 'development'
      });
    }
      , 'Missing merchantId')
  );

  it('raises an exception if publicKey is null', () =>
    assert.throws(function () {
      new Config({
        merchantId: 'merchantId',
        privateKey: 'privateKey',
        environment: 'development'
      });
    }
      , 'Missing publicKey')
  );

  it('raises an exception if publicKey is empty', () =>
    assert.throws(function () {
      new Config({
        merchantId: 'merchantId',
        publicKey: '',
        privateKey: 'privateKey',
        environment: 'development'
      });
    }
      , 'Missing publicKey')
  );

  it('raises an exception if privateKey is null', () =>
    assert.throws(function () {
      new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        environment: 'development'
      });
    }
      , 'Missing privateKey')
  );

  it('raises an exception if privateKey is empty', () =>
    assert.throws(function () {
      new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: '',
        environment: 'development'
      });
    }
      , 'Missing privateKey')
  );

  it('raises an exception if environment is null', () =>
    assert.throws(function () {
      new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey'
      });
    }
      , 'Missing environment')
  );

  it('raises an exception if environment is empty', () =>
    assert.throws(function () {
      new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: ''
      });
    }
      , 'Missing environment')
  );

  describe('baseMerchantUrl', () =>
    it('returns the url for a merchant', function () {
      let config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: new Environment('localhost', 3000, false)
      });

      assert.equal(config.baseMerchantUrl(), 'http://localhost/merchants/merchantId');
    })
  );

  describe('timeout', () =>
    it('defaults to 60 seconds', function () {
      let config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: 'development'
      });

      assert.equal(config.timeout, 60000);
    })
  );

  describe('keepAlive', () => {
    it('defaults to disabled', function () {
      let config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: 'development'
      });

      assert.equal(config.keepAliveAgentEnabled, false);
      assert.equal(config.keepAliveConfig.keepAlive, true);
    });

    it('is enabled when user passes in a config', function () {
      let config = new Config({
        merchantId: 'merchantId',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
        environment: 'development',
        keepAlive: {
          keepAliveMsecs: 9001
        }
      });

      assert.equal(config.keepAliveAgentEnabled, true);
      assert.equal(config.keepAliveConfig.keepAlive, true);
      assert.equal(config.keepAliveConfig.keepAliveMsecs, 9001);
    });
  });

  describe('accessToken', function () {
    it('uses accessToken parsed environment', function () {
      let config = new Config({
        accessToken: 'access_token$development$integration_merchant_id$f388b1cc'
      });

      assert.equal(config.environment, Environment.Development);
    });

    it('logs an error if config environment is provided and not the same as accessToken environment', () => {
      sinon.stub(console, 'error');

      new Config({
        accessToken: 'access_token$development$integration_merchant_id$f388b1cc',
        environment: 'production'
      });

      assert.equal(console.error.firstCall.args[0], 'Warning: AccessToken environment does not match environment passed in config'); // eslint-disable-line no-console
    });
  });
});
