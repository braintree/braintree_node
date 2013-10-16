require("../spec_helper")
{Config} = require('../../lib/braintree/config')

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
