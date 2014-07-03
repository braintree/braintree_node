require('../../spec_helper')
braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')

describe "ClientTokenGateway", ->
  it "generates an authorization fingerprint that is accepted by the gateway", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))

    specHelper.defaultGateway.clientToken.generate({}, (err, result) ->
      assert.isTrue(result.success)
      clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
      encodedFingerprint = clientToken.authorizationFingerprint

      params = {
        authorizationFingerprint: encodedFingerprint,
        sharedCustomerIdentifier: "test-identifier",
        sharedCustomerIdentifierType: "testing"
      }

      myHttp.get("/client_api/nonces.json", params, (statusCode) ->
        assert.equal(statusCode, 200)
        done()
      )
    )

  it "it allows a client token version to be specified", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))

    specHelper.defaultGateway.clientToken.generate({version: 1}, (err, result) ->
      assert.isTrue(result.success)
      clientToken = JSON.parse(result.clientToken)
      assert.equal(clientToken.version, 1)
      done()
    )

  it "defaults to version 2", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))

    specHelper.defaultGateway.clientToken.generate({}, (err, result) ->
      encoded_client_token = result.clientToken
      decoded_client_token = new Buffer(encoded_client_token, "base64").toString("utf8")
      unescaped_client_token = decoded_client_token.replace("\\u0026", "&")
      clientToken = JSON.parse(decoded_client_token)
      assert.equal(clientToken.version, "2")
      done()
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
        clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
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

        myHttp.post("/client_api/nonces.json", params, (statusCode) ->
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
          clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
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

          myHttp.post("/client_api/nonces.json", params, (statusCode) ->
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
        clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
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

        myHttp.post("/client_api/nonces.json", params, (statusCode) ->
          assert.equal(statusCode, 201)
          specHelper.defaultGateway.clientToken.generate({
            customerId: customer.id,
            options: {
              failOnDuplicatePaymentMethod: true
            }
          }, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint
            params.authorizationFingerprint = authorizationFingerprint

            myHttp.post("/client_api/nonces.json", params, (statusCode) ->
              assert.equal(statusCode, 422)
              done()
            )
          )
        )
      )
    )

  it "can pass merchantAccountId", (done) ->
    myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
    clientTokenParams = {
      merchantAccountId: "my_merchant_account"
    }

    specHelper.defaultGateway.clientToken.generate(clientTokenParams, (err, result) ->
      assert.isTrue(result.success)
      clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
      assert.equal(clientToken.merchantAccountId, "my_merchant_account")
      done()
    )

  it "returns an error when an invalid parameter is supplied", (done) ->
    specHelper.defaultGateway.clientToken.generate({
      customrId: "1234"
    }, (err, result) ->
      assert.equal(err.type, "authorizationError")
      done()
    )
