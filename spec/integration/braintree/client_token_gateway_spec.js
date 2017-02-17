'use strict';

require('../../spec_helper');
let { braintree } = specHelper;
let { Config } = require('../../../lib/braintree/config');

describe("ClientTokenGateway", function() {
  it("generates an authorization fingerprint that is accepted by the gateway", function(done) {
    let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));

    return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
      assert.isTrue(result.success);
      let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
      let encodedFingerprint = clientToken.authorizationFingerprint;

      let params = {
        authorizationFingerprint: encodedFingerprint,
        sharedCustomerIdentifier: "test-identifier",
        sharedCustomerIdentifierType: "testing"
      };

      return myHttp.get("/client_api/v1/payment_methods.json", params, function(statusCode) {
        assert.equal(statusCode, 200);
        return done();
      });
    });
  });

  it("it allows a client token version to be specified", function(done) {
    let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));

    return specHelper.defaultGateway.clientToken.generate({version: 1}, function(err, result) {
      assert.isTrue(result.success);
      let clientToken = JSON.parse(result.clientToken);
      assert.equal(clientToken.version, 1);
      return done();
    });
  });

  it("defaults to version 2", function(done) {
    let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));

    return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
      let encoded_client_token = result.clientToken;
      let decoded_client_token = new Buffer(encoded_client_token, "base64").toString("utf8");
      let unescaped_client_token = decoded_client_token.replace("\\u0026", "&");
      let clientToken = JSON.parse(decoded_client_token);
      assert.equal(clientToken.version, 2);
      return done();
    });
  });

  it("can pass verifyCard", done =>
    specHelper.defaultGateway.customer.create({}, function(err, result) {
      let customerId = result.customer.id;
      let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));

      return specHelper.defaultGateway.clientToken.generate({
        customerId,
        options: {
          verifyCard: true
        }
      }, function(err, result) {
        assert.isTrue(result.success);
        let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
        let { authorizationFingerprint } = clientToken;

        let params = {
          authorizationFingerprint,
          sharedCustomerIdentifierType: "testing",
          sharedCustomerIdentifier: "testing-identifier",
          credit_card: {
            number: "4115111111111115",
            expiration_month: "11",
            expiration_year: "2099"
          }
        };

        return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode) {
          assert.equal(statusCode, 422);
          return done();
        });
      });
    })
  );

  it("can pass makeDefault", done =>
    specHelper.defaultGateway.customer.create({}, function(err, result) {
      let customerId = result.customer.id;
      return specHelper.defaultGateway.creditCard.create({
        customerId,
        number: "4242424242424242",
        expirationDate: "11/2099"
      }, function(err, result) {
        assert.isTrue(result.success);
        let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));

        return specHelper.defaultGateway.clientToken.generate({
          customerId,
          options: {
            makeDefault: true
          }
        }, function(err,result) {
          assert.isTrue(result.success);
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let { authorizationFingerprint } = clientToken;
          let params = {
            authorizationFingerprint,
            sharedCustomerIdentifierType: "testing",
            sharedCustomerIdentifier: "testing-identifier",
            credit_card: {
              number: "4111111111111111",
              expiration_month: "11",
              expiration_year: "2099"
            }
          };

          return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode) {
            assert.equal(statusCode, 201);
            return specHelper.defaultGateway.customer.find(customerId, function(err, customer) {
              assert.equal(2, customer.creditCards.length);
              for (let index in customer.creditCards) {
                let credit_card = customer.creditCards[index];
                if (credit_card.last4 === "1111") {
                  assert.isTrue(credit_card.default);
                }
              }
              return done();
            });
          });
        });
      });
    })
  );

  it("can pass failOnDuplicatePaymentMethod", done =>
    specHelper.defaultGateway.customer.create({}, function(err, result) {
      let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));

      let { customer } = result;
      return specHelper.defaultGateway.clientToken.generate({
        customerId: customer.id
      }, function(err, result) {
        let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
        let { authorizationFingerprint } = clientToken;

        let params = {
          authorizationFingerprint,
          sharedCustomerIdentifierType: "testing",
          sharedCustomerIdentifier: "testing-identifier",
          credit_card: {
            number: "4111111111111111",
            expiration_month: "11",
            expiration_year: "2099"
          }
        };

        return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode) {
          assert.equal(statusCode, 201);
          return specHelper.defaultGateway.clientToken.generate({
            customerId: customer.id,
            options: {
              failOnDuplicatePaymentMethod: true
            }
          }, function(err, result) {
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            ({ authorizationFingerprint } = clientToken);
            params.authorizationFingerprint = authorizationFingerprint;

            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode) {
              assert.equal(statusCode, 422);
              return done();
            });
          });
        });
      });
    })
  );

  it("can pass merchantAccountId", function(done) {
    let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
    let clientTokenParams = {
      merchantAccountId: "my_merchant_account"
    };

    return specHelper.defaultGateway.clientToken.generate(clientTokenParams, function(err, result) {
      assert.isTrue(result.success);
      let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
      assert.equal(clientToken.merchantAccountId, "my_merchant_account");
      return done();
    });
  });

  it("calls callback with an error when an invalid parameter is supplied", done =>
    specHelper.defaultGateway.clientToken.generate({
      customrId: "1234"
    }, function(err, result) {
      assert.equal(err.type, "invalidKeysError");
      assert.equal(err.message, "These keys are invalid: customrId");
      return done();
    })
  );

  return it("returns an error when an non-existant customer_id is provided", function(done) {
    let clientToken;
    return clientToken = specHelper.defaultGateway.clientToken.generate({
      customerId: 3
    }, function(err, result) {
      assert.equal(result.message, "Customer specified by customer_id does not exist");
      return done();
    });
  });
});
