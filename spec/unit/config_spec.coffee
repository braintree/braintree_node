require("../spec_helper")
{Config} = require('../../lib/braintree/config')
{Environment} = require('../../lib/braintree/environment')

describe "Config", ->
  it "can be configured with merchant credentials", ->
    config = new Config(
      merchantId: 'merchantId'
      publicKey: 'publicKey'
      privateKey: 'privateKey'
    )

    assert.equal(config.merchantId, 'merchantId')
    assert.equal(config.publicKey, 'publicKey')
    assert.equal(config.privateKey, 'privateKey')

  it "can be configured with partner credentials", ->
    config = new Config(
      partnerId: 'partnerId'
      publicKey: 'publicKey'
      privateKey: 'privateKey'
    )

    assert.equal(config.merchantId, 'partnerId')
    assert.equal(config.publicKey, 'publicKey')
    assert.equal(config.privateKey, 'privateKey')

  describe "baseMerchantUrl", ->
    it "returns the url for a merchant", ->
      config = new Config(
        merchantId: 'merchantId'
        publicKey: 'publicKey'
        privateKey: 'privateKey'
        environment: new Environment('localhost', 3000, false)
      )

      assert.equal(config.baseMerchantUrl(), "http://localhost/merchants/merchantId")

  describe "timeout", ->
    it "defaults to 60 seconds", ->
      config = new Config(
        merchantId: 'merchantId'
        publicKey: 'publicKey'
        privateKey: 'privateKey'
      )

      assert.equal(config.timeout, 60000)
