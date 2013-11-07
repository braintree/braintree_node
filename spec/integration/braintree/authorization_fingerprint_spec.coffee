require('../../spec_helper')
braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')

describe "AuthorizationFingerprint", ->
  it "is verified by the gateway", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
    fingerprint = specHelper.defaultGateway.generateAuthorizationFingerprint()
    encodedFingerprint = encodeURIComponent(fingerprint)
    url = "/client_api/credit_cards.json?"
    url += "authorizationFingerprint=#{encodedFingerprint}"
    url += "&sessionIdentifierType=testing"
    url += "&sessionIdentifier=test-identifier"

    myHttp.get(url, (statusCode) ->
      assert.equal(200, statusCode)
      done()
    )

  it "can pass verifyCard", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
    fingerprint = specHelper.defaultGateway.generateAuthorizationFingerprint(verifyCard: true)
    params = {
      authorizationFingerprint: fingerprint,
      sessionIdentifierType: "testing",
      sessionIdentifier: "testing-identifier",
      credit_card: {
        number: "4115111111111115",
        expiration_month: "11",
        expiration_year: "2099"
      }
    }

    myHttp.post("/client_api/credit_cards.json", params, (statusCode) ->
      assert.equal(statusCode, 422)
      done()
    )

  it "can pass makeDefault", (done) ->
    specHelper.defaultGateway.customer.create({}, (err, result) ->
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
      fingerprint = specHelper.defaultGateway.generateAuthorizationFingerprint({
        makeDefault: true,
        customerId: result.customer.id
      })

      params = {
        authorizationFingerprint: fingerprint,
        sessionIdentifierType: "testing",
        sessionIdentifier: "testing-identifier",
        credit_card: {
          number: "4111111111111111",
          expiration_month: "11",
          expiration_year: "2099"
        }
      }

      myHttp.post("/client_api/credit_cards.json", params, (statusCode) ->
        assert.equal(statusCode, 200)
        specHelper.defaultGateway.customer.find(result.customer.id, (err, customer) ->
          assert.isTrue(customer.creditCards[0].default)
          done()
        )
      )
    )

  it "can pass failOnDuplicatePaymentMethod", (done) ->
    specHelper.defaultGateway.customer.create({}, (err, result) ->
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
      fingerprint = specHelper.defaultGateway.generateAuthorizationFingerprint({
        customerId: result.customer.id
      })

      params = {
        authorizationFingerprint: fingerprint,
        sessionIdentifierType: "testing",
        sessionIdentifier: "testing-identifier",
        credit_card: {
          number: "4111111111111111",
          expiration_month: "11",
          expiration_year: "2099"
        }
      }

      myHttp.post("/client_api/credit_cards.json", params, (statusCode) ->
        assert.equal(statusCode, 200)
        fingerprint = specHelper.defaultGateway.generateAuthorizationFingerprint({
          customerId: result.customer.id,
          failOnDuplicatePaymentMethod: true
        })
        params.authorizationFingerprint = fingerprint
        myHttp.post("/client_api/credit_cards.json", params, (statusCode) ->
          assert.equal(statusCode, 422)
          done()
        )
      )
    )
