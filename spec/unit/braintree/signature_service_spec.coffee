require('../../spec_helper')
{SignatureService} = require('../../../lib/braintree/signature_service')

describe "SignatureService", ->
  it "signs the data with the given key and hash", ->
    hashFunction = (key, data) -> "#{data}-hashed-with-#{key}"
    signatureService = new SignatureService("my-key", hashFunction)
    signed = signatureService.sign("my-data")
    assert.equal(signed, "my-data-hashed-with-my-key|my-data")
