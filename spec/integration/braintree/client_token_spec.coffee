require('../../spec_helper')
braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')

describe "ClientToken", ->
  it "is verified by the gateway", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
    authorizationFingerprint = JSON.parse(specHelper.defaultGateway.generateClientToken()).authorizationFingerprint
    encodedFingerprint = encodeURIComponent(authorizationFingerprint)
    url = "/client_api/credit_cards.json?"
    url += "authorizationFingerprint=#{encodedFingerprint}"
    url += "&sharedCustomerIdentifierType=testing"
    url += "&sharedCustomerIdentifier=test-identifier"

    myHttp.get(url, (statusCode) ->
      assert.equal(200, statusCode)
      done()
    )

  it "can pass verifyCard", (done) ->
    specHelper.defaultGateway.customer.create({}, (err, result) ->
      customerId = result.customer.id
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
      clientToken = specHelper.defaultGateway.generateClientToken(customerId: customerId, verifyCard: true)
      authorizationFingerprint = JSON.parse(clientToken).authorizationFingerprint
      params = {
        authorizationFingerprint: authorizationFingerprint,
        sharedCustomerIdentifierType: "testing",
        sharedCustomerIdentifier: "testing-identifier",
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
    )

  it "can pass makeDefault", (done) ->
    specHelper.defaultGateway.customer.create({}, (err, result) ->
      customerId = result.customer.id
      specHelper.defaultGateway.creditCard.create({
        customerId: customerId,
        number: "4242424242424242",
        expirationDate: "11/2099"
      }, (err, result) ->
        assert.isTrue(result.success)
        myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))

        clientToken = specHelper.defaultGateway.generateClientToken({
          makeDefault: true,
          customerId: customerId
        })
        authorizationFingerprint = JSON.parse(clientToken).authorizationFingerprint

        params = {
          authorizationFingerprint: authorizationFingerprint,
          sharedCustomerIdentifierType: "testing",
          sharedCustomerIdentifier: "testing-identifier",
          credit_card: {
            number: "4111111111111111",
            expiration_month: "11",
            expiration_year: "2099"
          }
        }

        myHttp.post("/client_api/credit_cards.json", params, (statusCode) ->
          assert.equal(statusCode, 201)
          specHelper.defaultGateway.customer.find(customerId, (err, customer) ->
            assert.equal(2, customer.creditCards.length)
            for index, credit_card of customer.creditCards
              if credit_card.last4 == "1111"
                assert.isTrue(credit_card.default)
            done()
          )
        )
      )
    )

  it "can pass failOnDuplicatePaymentMethod", (done) ->
    specHelper.defaultGateway.customer.create({}, (err, result) ->
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
      clientToken = specHelper.defaultGateway.generateClientToken({
        customerId: result.customer.id
      })
      authorizationFingerprint = JSON.parse(clientToken).authorizationFingerprint

      params = {
        authorizationFingerprint: authorizationFingerprint,
        sharedCustomerIdentifierType: "testing",
        sharedCustomerIdentifier: "testing-identifier",
        credit_card: {
          number: "4111111111111111",
          expiration_month: "11",
          expiration_year: "2099"
        }
      }

      myHttp.post("/client_api/credit_cards.json", params, (statusCode) ->
        assert.equal(statusCode, 201)
        clientToken = specHelper.defaultGateway.generateClientToken({
          customerId: result.customer.id,
          failOnDuplicatePaymentMethod: true
        })
        authorizationFingerprint = JSON.parse(clientToken).authorizationFingerprint
        params.authorizationFingerprint = authorizationFingerprint
        myHttp.post("/client_api/credit_cards.json", params, (statusCode) ->
          assert.equal(statusCode, 422)
          done()
        )
      )
    )
