"use strict";

let braintree = specHelper.braintree;
let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;

describe("SepaDirectDebitGateway", function () {
  describe("find", function () {
    it("finds the sepa direct debit account", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let customer = response.customer;
        let paymentMethodParams = {
          customerId: customer.id,
          paymentMethodNonce: Nonces.SepaDirectDebit,
        };

        specHelper.defaultGateway.paymentMethod.create(
          paymentMethodParams,
          function (err, response) {
            let paymentMethodToken = response.paymentMethod.token;

            specHelper.defaultGateway.sepaDirectDebitAccount.find(
              paymentMethodToken,
              function (err, sepaDirectDebitAccount) {
                assert.isNull(err);

                assert.equal(sepaDirectDebitAccount.customerId, customer.id);
                assert.equal(sepaDirectDebitAccount.mandateType, "RECURRENT");
                assert.equal(
                  sepaDirectDebitAccount.merchantOrPartnerCustomerId,
                  "a-fake-mp-customer-id"
                );
                assert.equal(sepaDirectDebitAccount.default, true);
                assert.equal(sepaDirectDebitAccount.last4, "1234");
                assert.equal(
                  sepaDirectDebitAccount.bankReferenceToken,
                  "a-fake-bank-reference-token"
                );
                assert.isString(sepaDirectDebitAccount.token);
                assert.isString(sepaDirectDebitAccount.globalId);
                assert.isString(sepaDirectDebitAccount.graphQLId);
                assert.isString(sepaDirectDebitAccount.customerGlobalId);
                assert.isString(sepaDirectDebitAccount.createdAt);
                assert.isString(sepaDirectDebitAccount.updatedAt);
                assert.match(sepaDirectDebitAccount.imageUrl, /svg/);

                done();
              }
            );
          }
        );
      }));

    it("handles not finding the sepa direct debit account", (done) =>
      specHelper.defaultGateway.sepaDirectDebitAccount.find(
        "NONEXISTENT_TOKEN",
        function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);

          done();
        }
      ));

    it("handles whitespace", (done) =>
      specHelper.defaultGateway.sepaDirectDebitAccount.find(
        " ",
        function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);

          done();
        }
      ));

    it("returns subscriptions associated with a SEPA direct debit account", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let paymentMethodParams = {
          customerId: response.customer.id,
          paymentMethodNonce: Nonces.SepaDirectDebit,
        };

        specHelper.defaultGateway.paymentMethod.create(
          paymentMethodParams,
          function (err, response) {
            let token = response.paymentMethod.token;

            let subscriptionParams = {
              paymentMethodToken: token,
              planId: specHelper.plans.trialless.id,
            };

            specHelper.defaultGateway.subscription.create(
              subscriptionParams,
              function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                let subscription1 = response.subscription;

                specHelper.defaultGateway.subscription.create(
                  subscriptionParams,
                  function (err, response) {
                    assert.isNull(err);
                    assert.isTrue(response.success);

                    let subscription2 = response.subscription;

                    specHelper.defaultGateway.sepaDirectDebitAccount.find(
                      token,
                      function (err, sepaDirectDebitAccount) {
                        assert.isNull(err);

                        assert.equal(
                          sepaDirectDebitAccount.subscriptions.length,
                          2
                        );
                        let subscriptionIds = [
                          sepaDirectDebitAccount.subscriptions[0].id,
                          sepaDirectDebitAccount.subscriptions[1].id,
                        ];

                        assert.include(subscriptionIds, subscription1.id);
                        assert.include(subscriptionIds, subscription2.id);

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
  });

  describe("delete", function () {
    let paymentMethodToken;

    before((done) =>
      specHelper.defaultGateway.customer.create(
        { firstName: "Jane", lastName: "Doe" },
        function (err, response) {
          let customer = response.customer;
          let paymentMethodParams = {
            customerId: customer.id,
            paymentMethodNonce: Nonces.SepaDirectDebit,
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              paymentMethodToken = response.paymentMethod.token;
              done();
            }
          );
        }
      )
    );

    it("deletes the sepa direct debit account", (done) =>
      specHelper.defaultGateway.sepaDirectDebitAccount.delete(
        paymentMethodToken,
        function (err) {
          assert.isNull(err);

          specHelper.defaultGateway.sepaDirectDebitAccount.find(
            paymentMethodToken,
            function (err) {
              assert.equal(err.type, braintree.errorTypes.notFoundError);
              done();
            }
          );
        }
      ));

    it("handles invalid tokens", (done) =>
      specHelper.defaultGateway.sepaDirectDebitAccount.delete(
        "NON_EXISTENT_TOKEN",
        function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);

          done();
        }
      ));
  });
});
