"use strict";
/* eslint-disable camelcase,new-cap */

let Config = require("../../../lib/braintree/config").Config;

describe("ClientTokenGateway", function () {
  it("generates an authorization fingerprint that is accepted by the gateway", function (done) {
    let myHttp = new specHelper.clientApiHttp(
      new Config(specHelper.defaultConfig)
    );

    specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
      assert.isTrue(result.success);
      let clientToken = JSON.parse(
        specHelper.decodeClientToken(result.clientToken)
      );
      let encodedFingerprint = clientToken.authorizationFingerprint;

      let params = {
        authorizationFingerprint: encodedFingerprint,
        sharedCustomerIdentifier: "test-identifier",
        sharedCustomerIdentifierType: "testing",
      };

      return myHttp.get(
        "/client_api/v1/payment_methods.json",
        params,
        function (statusCode) {
          assert.equal(statusCode, 200);
          done();
        }
      );
    });
  });

  it("it allows a client token version to be specified", function (done) {
    specHelper.defaultGateway.clientToken.generate(
      { version: 1 },
      function (err, result) {
        assert.isTrue(result.success);
        let clientToken = JSON.parse(result.clientToken);

        assert.equal(clientToken.version, 1);
        done();
      }
    );
  });

  it("defaults to version 2", function (done) {
    specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
      let encodedClientToken = result.clientToken;
      const decodedClientToken = Buffer.from(
        encodedClientToken,
        "base64"
      ).toString("utf8");
      let clientToken = JSON.parse(decodedClientToken);

      assert.equal(clientToken.version, 2);
      done();
    });
  });

  it("can pass verifyCard", (done) =>
    specHelper.defaultGateway.customer.create({}, function (err, result) {
      let customerId = result.customer.id;
      let myHttp = new specHelper.clientApiHttp(
        new Config(specHelper.defaultConfig)
      );

      specHelper.defaultGateway.clientToken.generate(
        {
          customerId,
          options: {
            verifyCard: true,
          },
        },
        function (err, result) {
          assert.isTrue(result.success);
          let clientToken = JSON.parse(
            specHelper.decodeClientToken(result.clientToken)
          );
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint,
            sharedCustomerIdentifierType: "testing",
            sharedCustomerIdentifier: "testing-identifier",
            credit_card: {
              number: "4115111111111115",
              expiration_month: "11",
              expiration_year: "2099",
            },
          };

          return myHttp.post(
            "/client_api/v1/payment_methods/credit_cards.json",
            params,
            function (statusCode) {
              assert.equal(statusCode, 422);
              done();
            }
          );
        }
      );
    }));

  it("can pass makeDefault", (done) =>
    specHelper.defaultGateway.customer.create({}, function (err, result) {
      let customerId = result.customer.id;

      specHelper.defaultGateway.creditCard.create(
        {
          customerId,
          number: "4242424242424242",
          expirationDate: "11/2099",
        },
        function (err, result) {
          assert.isTrue(result.success);
          let myHttp = new specHelper.clientApiHttp(
            new Config(specHelper.defaultConfig)
          );

          specHelper.defaultGateway.clientToken.generate(
            {
              customerId,
              options: {
                makeDefault: true,
              },
            },
            function (err, result) {
              assert.isTrue(result.success);
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;
              let params = {
                authorizationFingerprint,
                sharedCustomerIdentifierType: "testing",
                sharedCustomerIdentifier: "testing-identifier",
                credit_card: {
                  number: "4111111111111111",
                  expiration_month: "11",
                  expiration_year: "2099",
                },
              };

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode) {
                  assert.equal(statusCode, 201);
                  specHelper.defaultGateway.customer.find(
                    customerId,
                    function (err, customer) {
                      assert.equal(2, customer.creditCards.length);
                      for (let index in customer.creditCards) {
                        if (!customer.creditCards.hasOwnProperty(index)) {
                          continue;
                        }
                        let creditCard = customer.creditCards[index];

                        if (creditCard.last4 === "1111") {
                          assert.isTrue(creditCard.default);
                        }
                      }
                      done();
                    }
                  );
                }
              );
            }
          );
        }
      );
    }));

  it("can pass failOnDuplicatePaymentMethod", (done) =>
    specHelper.defaultGateway.customer.create({}, function (err, result) {
      let myHttp = new specHelper.clientApiHttp(
        new Config(specHelper.defaultConfig)
      );

      let customer = result.customer;

      specHelper.defaultGateway.clientToken.generate(
        {
          customerId: customer.id,
        },
        function (err, result) {
          let clientToken = JSON.parse(
            specHelper.decodeClientToken(result.clientToken)
          );
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint,
            sharedCustomerIdentifierType: "testing",
            sharedCustomerIdentifier: "testing-identifier",
            credit_card: {
              number: "4111111111111111",
              expiration_month: "11",
              expiration_year: "2099",
            },
          };

          return myHttp.post(
            "/client_api/v1/payment_methods/credit_cards.json",
            params,
            function (statusCode) {
              assert.equal(statusCode, 201);
              specHelper.defaultGateway.clientToken.generate(
                {
                  customerId: customer.id,
                  options: {
                    failOnDuplicatePaymentMethod: true,
                  },
                },
                function (err, result) {
                  clientToken = JSON.parse(
                    specHelper.decodeClientToken(result.clientToken)
                  );
                  let authorizationFingerprint =
                    clientToken.authorizationFingerprint;

                  params.authorizationFingerprint = authorizationFingerprint;

                  return myHttp.post(
                    "/client_api/v1/payment_methods/credit_cards.json",
                    params,
                    function (statusCode) {
                      assert.equal(statusCode, 422);
                      done();
                    }
                  );
                }
              );
            }
          );
        }
      );
    }));

  it("can pass merchantAccountId", function (done) {
    let expectedMerchantAccountId = specHelper.nonDefaultMerchantAccountId;
    let clientTokenParams = {
      merchantAccountId: expectedMerchantAccountId,
    };

    specHelper.defaultGateway.clientToken.generate(
      clientTokenParams,
      function (err, result) {
        assert.isTrue(result.success);
        let clientToken = JSON.parse(
          specHelper.decodeClientToken(result.clientToken)
        );

        assert.equal(clientToken.merchantAccountId, expectedMerchantAccountId);
        done();
      }
    );
  });

  it("can pass domains", function (done) {
    let expectedDomains = ["example.com"];
    let clientTokenParams = {
      domains: expectedDomains,
    };

    specHelper.defaultGateway.clientToken.generate(
      clientTokenParams,
      function (err, result) {
        assert.isTrue(result.success);
        let clientToken = JSON.parse(
          specHelper.decodeClientToken(result.clientToken)
        );

        let authFingerprintPayload = Buffer.from(
          clientToken.authorizationFingerprint,
          "base64"
        ).toString("utf8");

        expectedDomains.forEach((domain) => {
          assert.isTrue(authFingerprintPayload.includes(domain));
        });
        done();
      }
    );
  });

  it("calls callback with an error when an invalid domain is supplied", (done) =>
    specHelper.defaultGateway.clientToken.generate(
      {
        domains: ["example"],
      },
      function (err, result) {
        assert.isFalse(result.success);
        assert.equal(
          result.message,
          "Client token domains must be valid domain names (RFC 1035), e.g. example.com"
        );
        done();
      }
    ));

  it("calls callback with an error when too many domains are supplied", (done) =>
    specHelper.defaultGateway.clientToken.generate(
      {
        domains: [
          "example1.com",
          "example2.com",
          "example3.com",
          "example4.com",
          "example5.com",
          "example6.com",
        ],
      },
      function (err, result) {
        assert.isFalse(result.success);
        assert.equal(
          result.message,
          "Cannot specify more than 5 client token domains"
        );
        done();
      }
    ));

  it("calls callback with an error when an invalid parameter is supplied", (done) =>
    specHelper.defaultGateway.clientToken.generate(
      {
        customrId: "1234",
      },
      function (err) {
        assert.equal(err.type, "invalidKeysError");
        assert.equal(err.message, "These keys are invalid: customrId");
        done();
      }
    ));

  it("returns an error when an non-existant customer_id is provided", function (done) {
    specHelper.defaultGateway.clientToken.generate(
      {
        customerId: 3,
      },
      function (err, result) {
        assert.equal(
          result.message,
          "Customer specified by customer_id does not exist"
        );
        done();
      }
    );
  });
});
