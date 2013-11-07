require('../../spec_helper')
braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')

describe "AuthorizationFingerprint", ->
  it "is verified by the gateway", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
    fingerprint = braintree.generateAuthorizationFingerprint()
    url = "/client_api/credit_cards.json?"
    url += "authorizationFingerprint=#{fingerprint}"
    url += "&sessionIdentifierType=testing"
    url += "&sessionIdentifier=test-identifier"

    myHttp.get(url, (error, response) ->
      assert.isNull(error)
      done()
    )

