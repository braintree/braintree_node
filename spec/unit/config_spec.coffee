require("../spec_helper")
{Config} = require('../../lib/braintree/config')
{Environment} = require('../../lib/braintree/environment')

describe "Config", ->
  it "can be configured with merchant credentials", ->
    config = new Config(
      merchantId: 'merchantId'
      publicKey: 'publicKey'
      privateKey: 'privateKey'
      environment: 'development'
    )

    assert.equal(config.merchantId, 'merchantId')
    assert.equal(config.publicKey, 'publicKey')
    assert.equal(config.privateKey, 'privateKey')

  it "can be configured with partner credentials", ->
    config = new Config(
      partnerId: 'partnerId'
      publicKey: 'publicKey'
      privateKey: 'privateKey'
      environment: 'development'
    )

    assert.equal(config.merchantId, 'partnerId')
    assert.equal(config.publicKey, 'publicKey')
    assert.equal(config.privateKey, 'privateKey')

  it "raises an exception if merchantId is null", ->
    assert.throws(->
      config = new Config(
        publicKey: 'publicKey'
        privateKey: 'privateKey'
        environment: 'development'
      )
    , 'Missing merchantId')

  it "raises an exception if merchantId is empty", ->
    assert.throws(->
      config = new Config(
        merchantId: ''
        publicKey: 'publicKey'
        privateKey: 'privateKey'
        environment: 'development'
      )
    , 'Missing merchantId')

  it "raises an exception if publicKey is null", ->
    assert.throws(->
      config = new Config(
        merchantId: 'merchantId'
        privateKey: 'privateKey'
        environment: 'development'
      )
    , 'Missing publicKey')

  it "raises an exception if publicKey is empty", ->
    assert.throws(->
      config = new Config(
        merchantId: 'merchantId'
        publicKey: ''
        privateKey: 'privateKey'
        environment: 'development'
      )
    , 'Missing publicKey')

  it "raises an exception if privateKey is null", ->
    assert.throws(->
      config = new Config(
        merchantId: 'merchantId'
        publicKey: 'publicKey'
        environment: 'development'
      )
    , 'Missing privateKey')

  it "raises an exception if privateKey is empty", ->
    assert.throws(->
      config = new Config(
        merchantId: 'merchantId'
        publicKey: 'publicKey'
        privateKey: ''
        environment: 'development'
      )
    , 'Missing privateKey')

  it "raises an exception if environment is null", ->
    assert.throws(->
      config = new Config(
        merchantId: 'merchantId'
        publicKey: 'publicKey'
        privateKey: 'privateKey'
      )
    , 'Missing environment')

  it "raises an exception if environment is empty", ->
    assert.throws(->
      config = new Config(
        merchantId: 'merchantId'
        publicKey: 'publicKey'
        privateKey: 'privateKey'
        environment: ''
      )
    , 'Missing environment')

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
        environment: 'development'
      )

      assert.equal(config.timeout, 60000)
