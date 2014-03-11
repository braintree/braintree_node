require('../../spec_helper')
braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')

describe "ClientTokenGateway", ->
  it "generates an authorization fingerprint that is accepted by the gateway", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))

    specHelper.defaultGateway.clientToken.generate({}, (err, result) ->
      assert.isTrue(result.success)
      clientToken = JSON.parse(result.clientToken)
      encodedFingerprint = clientToken.authorizationFingerprint

      params = {
        authorizationFingerprint: encodedFingerprint,
        sharedCustomerIdentifier: "test-identifier",
        sharedCustomerIdentifierType: "testing"
      }

      myHttp.get("/client_api/credit_cards.json", params, (statusCode) ->
        assert.equal(statusCode, 200)
        done()
      )
    )

  it "can pass verifyCard", (done) ->
    specHelper.defaultGateway.customer.create({}, (err, result) ->
      customerId = result.customer.id
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))

      specHelper.defaultGateway.clientToken.generate({
        customerId: customerId,
        options: {
          verifyCard: true
        }
      }, (err, result) ->
        assert.isTrue(result.success)
        clientToken = JSON.parse(result.clientToken)
        authorizationFingerprint = clientToken.authorizationFingerprint

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

        specHelper.defaultGateway.clientToken.generate({
          customerId: customerId,
          options: {
            makeDefault: true
          }
        }, (err,result) ->
          assert.isTrue(result.success)
          clientToken = JSON.parse(result.clientToken)
          authorizationFingerprint = clientToken.authorizationFingerprint
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
    )

  it "can pass failOnDuplicatePaymentMethod", (done) ->
    specHelper.defaultGateway.customer.create({}, (err, result) ->
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))

      customer = result.customer
      specHelper.defaultGateway.clientToken.generate({
        customerId: customer.id
      }, (err, result) ->
        clientToken = JSON.parse(result.clientToken)
        authorizationFingerprint = clientToken.authorizationFingerprint

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
          specHelper.defaultGateway.clientToken.generate({
            customerId: customer.id,
            options: {
              failOnDuplicatePaymentMethod: true
            }
          }, (err, result) ->
            clientToken = JSON.parse(result.clientToken)
            authorizationFingerprint = clientToken.authorizationFingerprint
            params.authorizationFingerprint = authorizationFingerprint

            myHttp.post("/client_api/credit_cards.json", params, (statusCode) ->
              assert.equal(statusCode, 422)
              done()
            )
          )
        )
      )
    )

  it "returns an error when an invalid parameter is supplied", (done) ->
    specHelper.defaultGateway.clientToken.generate({
      customrId: "1234"
    }, (err, result) ->
      assert.equal(err.type, "authorizationError")
      done()
    )
