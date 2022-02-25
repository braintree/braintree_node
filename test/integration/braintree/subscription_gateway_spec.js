"use strict";

let dateFormat = require("dateformat");
let braintree = specHelper.braintree;
let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;

function sortArrayByObject(array, key) {
  return array.sort((prevObj, nextObj) => {
    const str1 = prevObj[key].toUpperCase();
    const str2 = nextObj[key].toUpperCase();

    if (str1 < str2) {
      return -1;
    }

    if (str1 > str2) {
      return 1;
    }

    return 0;
  });
}

describe("SubscriptionGateway", function () {
  let customerId, creditCardToken;

  beforeEach(function (done) {
    let customerParams = {
      creditCard: {
        number: "5105105105105100",
        expirationDate: "05/12",
      },
    };

    specHelper.defaultGateway.customer.create(
      customerParams,
      function (err, response) {
        customerId = response.customer.id;
        creditCardToken = response.customer.creditCards[0].token;
        done();
      }
    );
  });

  describe("create", function () {
    it("creates a subscription", function (done) {
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(
            response.subscription.planId,
            specHelper.plans.trialless.id
          );
          assert.equal(
            response.subscription.price,
            specHelper.plans.trialless.price
          );
          assert.match(response.subscription.transactions[0].id, /^\w{6,}$/);
          assert.equal(
            response.subscription.transactions[0].creditCard.maskedNumber,
            "510510******5100"
          );
          assert.equal(
            response.subscription.transactions[0].planId,
            specHelper.plans.trialless.id
          );
          assert.isNotNull(response.subscription.createdAt);
          assert.isNotNull(response.subscription.updatedAt);

          done();
        }
      );
    });

    it("creates a subscription with a vaulted card nonce", function (done) {
      let paymentMethodParams = {
        creditCard: {
          number: "4111111111111111",
          expirationMonth: "12",
          expirationYear: "2099",
        },
      };

      specHelper.generateNonceForNewPaymentMethod(
        paymentMethodParams,
        customerId,
        function (nonce) {
          let subscriptionParams = {
            paymentMethodNonce: nonce,
            planId: specHelper.plans.trialless.id,
          };

          specHelper.defaultGateway.subscription.create(
            subscriptionParams,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(
                response.subscription.transactions[0].creditCard.maskedNumber,
                "411111******1111"
              );
              done();
            }
          );
        }
      );
    });

    it("creates a subscription with a vaulted paypal account nonce", function (done) {
      let paymentMethodParams = {
        paypalAccount: {
          consentCode: "PAYPAL_CONSENT_CODE",
        },
      };

      specHelper.generateNonceForNewPaymentMethod(
        paymentMethodParams,
        customerId,
        function (nonce) {
          let subscriptionParams = {
            paymentMethodNonce: nonce,
            planId: specHelper.plans.trialless.id,
          };

          specHelper.defaultGateway.subscription.create(
            subscriptionParams,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isString(
                response.subscription.transactions[0].paypalAccount.payerEmail
              );
              done();
            }
          );
        }
      );
    });

    it("creates a subscription with a vaulted paypal account token", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let paypalCustomerId = response.customer.id;
        let paymentMethodParams = {
          paypalAccount: {
            consentCode: "PAYPAL_CONSENT_CODE",
            token: `PAYPAL_ACCOUNT_${specHelper.randomId()}`,
          },
        };

        specHelper.generateNonceForNewPaymentMethod(
          paymentMethodParams,
          null,
          function (nonce) {
            paymentMethodParams = {
              paymentMethodNonce: nonce,
              customerId: paypalCustomerId,
            };

            specHelper.defaultGateway.paymentMethod.create(
              paymentMethodParams,
              function (err, response) {
                let paymentMethodToken = response.paymentMethod.token;

                let subscriptionParams = {
                  paymentMethodToken,
                  planId: specHelper.plans.trialless.id,
                };

                specHelper.defaultGateway.subscription.create(
                  subscriptionParams,
                  function (err, response) {
                    assert.isNull(err);
                    assert.isTrue(response.success);
                    assert.isString(
                      response.subscription.transactions[0].paypalAccount
                        .payerEmail
                    );
                    done();
                  }
                );
              }
            );
          }
        );
      }));

    it("creates a subscription with a vaulted paypal account token and description", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let paypalCustomerId = response.customer.id;
        let paymentMethodParams = {
          paypalAccount: {
            consentCode: "PAYPAL_CONSENT_CODE",
            token: `PAYPAL_ACCOUNT_${specHelper.randomId()}`,
          },
        };

        specHelper.generateNonceForNewPaymentMethod(
          paymentMethodParams,
          null,
          function (nonce) {
            paymentMethodParams = {
              paymentMethodNonce: nonce,
              customerId: paypalCustomerId,
            };

            specHelper.defaultGateway.paymentMethod.create(
              paymentMethodParams,
              function (err, response) {
                let paymentMethodToken = response.paymentMethod.token;

                let subscriptionParams = {
                  paymentMethodToken,
                  planId: specHelper.plans.trialless.id,
                  options: {
                    paypal: {
                      description: "A great product",
                    },
                  },
                };

                specHelper.defaultGateway.subscription.create(
                  subscriptionParams,
                  function (err, response) {
                    assert.isNull(err);
                    assert.isTrue(response.success);
                    assert.equal(
                      response.subscription.description,
                      "A great product"
                    );
                    assert.isString(
                      response.subscription.transactions[0].paypalAccount
                        .payerEmail
                    );
                    assert.equal(
                      response.subscription.transactions[0].paypalAccount
                        .description,
                      "A great product"
                    );
                    done();
                  }
                );
              }
            );
          }
        );
      }));

    it("does not vault an unverified paypal account payment method nonce", function (done) {
      let subscriptionParams = {
        paymentMethodNonce: Nonces.PayPalOneTimePayment,
        planId: specHelper.plans.trialless.id,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for("subscription").on("paymentMethodNonce")[0]
              .code,
            "91925"
          );

          done();
        }
      );
    });

    it("allows setting the first billing date", function (done) {
      let firstBillingDate = new Date();

      firstBillingDate.setFullYear(firstBillingDate.getFullYear() + 1);
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id,
        firstBillingDate,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          let expectedDate = new Date();

          expectedDate.setFullYear(expectedDate.getFullYear() + 1);

          let expectedDateString = dateFormat(expectedDate, "yyyy-mm-dd", true);

          assert.equal(
            response.subscription.firstBillingDate,
            expectedDateString
          );

          done();
        }
      );
    });

    it("handles declined transactions", function (done) {
      let subscriptionParams = {
        price: "2000.00",
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.match(response.transaction.id, /^\w{6,}$/);
          assert.equal(response.transaction.status, "processor_declined");
          assert.equal(
            response.transaction.creditCard.maskedNumber,
            "510510******5100"
          );

          done();
        }
      );
    });

    it("inherits addons and discounts", function (done) {
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.addonDiscountPlan.id,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          const addons = sortArrayByObject(response.subscription.addOns, "id");

          assert.equal(addons.length, 2);

          assert.equal(addons[0].id, "increase_10");
          assert.equal(addons[0].amount, "10.00");
          assert.equal(addons[0].quantity, 1);
          assert.equal(addons[0].numberOfBillingCycles, null);
          assert.isTrue(addons[0].neverExpires);
          assert.equal(addons[0].currentBillingCycle, 0);

          assert.equal(addons[1].id, "increase_20");
          assert.equal(addons[1].amount, "20.00");
          assert.equal(addons[1].quantity, 1);
          assert.equal(addons[1].numberOfBillingCycles, null);
          assert.isTrue(addons[1].neverExpires);
          assert.equal(addons[1].currentBillingCycle, 0);

          const discounts = sortArrayByObject(
            response.subscription.discounts,
            "id"
          );

          assert.equal(discounts.length, 2);

          assert.equal(discounts[0].id, "discount_11");
          assert.equal(discounts[0].amount, "11.00");
          assert.equal(discounts[0].quantity, 1);
          assert.equal(discounts[0].numberOfBillingCycles, null);
          assert.isTrue(discounts[0].neverExpires);
          assert.equal(discounts[0].currentBillingCycle, 0);

          assert.equal(discounts[1].id, "discount_7");
          assert.equal(discounts[1].amount, "7.00");
          assert.equal(discounts[1].quantity, 1);
          assert.equal(discounts[1].numberOfBillingCycles, null);
          assert.isTrue(discounts[1].neverExpires);
          assert.equal(discounts[1].currentBillingCycle, 0);

          done();
        }
      );
    });

    it("handles validation errors", function (done) {
      let subscriptionParams = {
        paymentMethodToken: "invalid_token",
        planId: "invalid_plan_id",
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          assert.isFalse(response.success);

          let messages = response.message.split("\n");

          assert.equal(messages.length, 2);
          assert.include(messages, "Payment method token is invalid.");
          assert.include(messages, "Plan ID is invalid.");
          assert.equal(
            response.errors.for("subscription").on("planId")[0].code,
            "91904"
          );
          assert.equal(
            response.errors.for("subscription").on("paymentMethodToken")[0]
              .code,
            "91903"
          );

          done();
        }
      );
    });

    it("handles validation errors on modification updates", function (done) {
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.addonDiscountPlan.id,
        addOns: {
          update: [
            { existingId: specHelper.addOns.increase10, amount: "invalid" },
            { existingId: specHelper.addOns.increase20, quantity: -10 },
          ],
        },
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors
              .for("subscription")
              .for("addOns")
              .for("update")
              .forIndex(0)
              .on("amount")[0].code,
            "92002"
          );
          assert.equal(
            response.errors
              .for("subscription")
              .for("addOns")
              .for("update")
              .forIndex(1)
              .on("quantity")[0].code,
            "92001"
          );

          done();
        }
      );
    });
  });

  describe("find", function () {
    it("finds a subscription", function (done) {
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        (err, response) =>
          specHelper.defaultGateway.subscription.find(
            response.subscription.id,
            function (err, subscription) {
              assert.isNull(err);
              assert.equal(subscription.planId, specHelper.plans.trialless.id);
              assert.equal(
                subscription.price,
                specHelper.plans.trialless.price
              );
              assert.equal(subscription.status, "Active");
              assert.equal(subscription.currentBillingCycle, 1);

              done();
            }
          )
      );
    });

    it("returns a not found error if given a bad id", (done) =>
      specHelper.defaultGateway.subscription.find(" ", function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      }));
  });

  describe("update", function () {
    let subscription;

    beforeEach(function (done) {
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id,
        price: "5.00",
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          subscription = response.subscription;
          done();
        }
      );
    });

    it("updates the subscription", function (done) {
      let subscriptionParams = { price: "8.00" };

      specHelper.defaultGateway.subscription.update(
        subscription.id,
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.subscription.price, "8.00");

          done();
        }
      );
    });

    it("updates the payment method using a payment method nonce", function (done) {
      let nonceParams = {
        creditCard: {
          number: "4111111111111111",
          expirationMonth: "12",
          expirationYear: "2099",
        },
      };

      specHelper.generateNonceForNewPaymentMethod(
        nonceParams,
        customerId,
        function (nonce) {
          let subscriptionParams = {
            paymentMethodNonce: nonce,
            planId: specHelper.plans.trialless.id,
          };

          specHelper.defaultGateway.subscription.update(
            subscription.id,
            subscriptionParams,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              specHelper.defaultGateway.creditCard.find(
                response.subscription.paymentMethodToken,
                function (err, creditCard) {
                  assert.equal(creditCard.maskedNumber, "411111******1111");
                  done();
                }
              );
            }
          );
        }
      );
    });

    it("updates the description", function (done) {
      let subscriptionParams = {
        options: {
          paypal: {
            description: "An incredible product",
          },
        },
      };

      specHelper.defaultGateway.subscription.update(
        subscription.id,
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(
            response.subscription.description,
            "An incredible product"
          );

          done();
        }
      );
    });

    it("handles validation errors", function (done) {
      let subscriptionParams = { price: "invalid" };

      specHelper.defaultGateway.subscription.update(
        subscription.id,
        subscriptionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for("subscription").on("price")[0].message,
            "Price is an invalid format."
          );
          assert.equal(
            response.errors.for("subscription").on("price")[0].code,
            "81904"
          );

          done();
        }
      );
    });
  });

  describe("retryCharge", function () {
    let subscription;

    beforeEach(function (done) {
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          subscription = response.subscription;
          specHelper.makePastDue(response.subscription, () => done());
        }
      );
    });

    it("retries charging a failed subscription", (done) =>
      specHelper.defaultGateway.subscription.retryCharge(
        subscription.id,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(
            response.transaction.amount,
            specHelper.plans.trialless.price
          );
          assert.equal(response.transaction.type, "sale");
          assert.equal(response.transaction.status, "authorized");

          done();
        }
      ));

    it("allows specifying submitForSettlemnt", (done) =>
      specHelper.defaultGateway.subscription.retryCharge(
        subscription.id,
        "6.00",
        true,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.amount, "6.00");
          assert.equal(response.transaction.type, "sale");
          assert.equal(response.transaction.status, "submitted_for_settlement");

          done();
        }
      ));

    it("allows specifying submitForSettlement and amount", (done) =>
      specHelper.defaultGateway.subscription.retryCharge(
        subscription.id,
        "6.00",
        true,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.amount, "6.00");
          assert.equal(response.transaction.type, "sale");
          assert.equal(response.transaction.status, "submitted_for_settlement");

          done();
        }
      ));

    it("allows specifying an amount", (done) =>
      specHelper.defaultGateway.subscription.retryCharge(
        subscription.id,
        "6.00",
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.amount, "6.00");
          assert.equal(response.transaction.type, "sale");
          assert.equal(response.transaction.status, "authorized");

          done();
        }
      ));
  });

  describe("cancel", function () {
    it("cancels a subscription", function (done) {
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        (err, response) =>
          specHelper.defaultGateway.subscription.cancel(
            response.subscription.id,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.subscription.status, "Canceled");

              done();
            }
          )
      );
    });

    it("handles validation errors", function (done) {
      let subscriptionParams = {
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id,
      };

      specHelper.defaultGateway.subscription.create(
        subscriptionParams,
        function (err, response) {
          let subscriptionId = response.subscription.id;

          specHelper.defaultGateway.subscription.cancel(subscriptionId, () =>
            specHelper.defaultGateway.subscription.cancel(
              subscriptionId,
              function (err, response) {
                assert.isFalse(response.success);
                assert.equal(
                  response.message,
                  "Subscription has already been canceled."
                );
                assert.equal(
                  response.errors.for("subscription").on("status")[0].code,
                  "81905"
                );

                done();
              }
            )
          );
        }
      );
    });

    it("returns a not found error if provided a bad id", (done) =>
      specHelper.defaultGateway.subscription.cancel(
        "nonexistent_subscription",
        function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);

          done();
        }
      ));
  });
});
