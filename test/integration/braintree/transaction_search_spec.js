"use strict";
/* eslint-disable no-loop-func */

let Braintree = require("../../../lib/braintree");
let Transaction = Braintree.Transaction;
let CreditCardNumbers =
  require("../../../lib/braintree/test_values/credit_card_numbers").CreditCardNumbers;
let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;
let CreditCard = Braintree.CreditCard;
let Writable = require("stream").Writable;
let braintree = specHelper.braintree;

describe("TransactionSearch", () =>
  describe("search", function () {
    it("finds transactions", function (done) {
      let firstName = `Tom_${specHelper.randomId()}`;
      let cardToken = `card_${specHelper.randomId()}`;
      let customerId = `customer_${specHelper.randomId()}`;

      let transactionParams = {
        billing: {
          company: "Braintree",
          countryName: "US",
          extendedAddress: "Apt B",
          firstName,
          lastName: "Guy",
          locality: "Chicago",
          postalCode: "60646",
          region: "IL",
          streetAddress: "123 Fake St",
        },
        shipping: {
          company: "Braintree",
          countryName: "United States of America",
          extendedAddress: "Apt B",
          firstName,
          lastName: "Guy",
          locality: "Chicago",
          postalCode: "60646",
          region: "IL",
          streetAddress: "123 Fake St",
        },
        amount: "5.00",
        creditCard: {
          number: "5105105105105100",
          expirationDate: "05/2012",
          cardholderName: "Tom Guy",
          token: cardToken,
        },
        customer: {
          id: customerId,
          company: "Braintree",
          email: "tom@example.com",
          fax: "(123)456-7890",
          firstName,
          lastName: "Guy",
          phone: "(456)123-7890",
          website: "http://www.example.com/",
        },
        orderId: "123",
        options: {
          storeInVault: true,
          submitForSettlement: true,
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.testing.settle(
            response.transaction.id,
            () =>
              specHelper.defaultGateway.transaction.find(
                response.transaction.id,
                function (err, transaction) {
                  let textCriteria = {
                    billingCompany: "Braintree",
                    billingCountryName: "United States of America",
                    billingExtendedAddress: "Apt B",
                    billingFirstName: firstName,
                    billingLastName: "Guy",
                    billingLocality: "Chicago",
                    billingPostalCode: "60646",
                    billingRegion: "IL",
                    billingStreetAddress: "123 Fake St",
                    creditCardCardholderName: "Tom Guy",
                    currency: "USD",
                    customerCompany: "Braintree",
                    customerEmail: "tom@example.com",
                    customerFax: "(123)456-7890",
                    customerFirstName: firstName,
                    customerId,
                    customerLastName: "Guy",
                    customerPhone: "(456)123-7890",
                    customerWebsite: "http://www.example.com/",
                    id: transaction.id,
                    orderId: "123",
                    paymentMethodToken: cardToken,
                    processorAuthorizationCode:
                      transaction.processorAuthorizationCode,
                    settlementBatchId: transaction.settlementBatchId,
                    shippingCompany: "Braintree",
                    shippingCountryName: "United States of America",
                    shippingExtendedAddress: "Apt B",
                    shippingFirstName: firstName,
                    shippingLastName: "Guy",
                    shippingLocality: "Chicago",
                    shippingPostalCode: "60646",
                    shippingRegion: "IL",
                    shippingStreetAddress: "123 Fake St",
                    creditCardExpirationDate: "05/2012",
                    creditCardUniqueIdentifier:
                      transaction.creditCard.uniqueNumberIdentifier,
                  };

                  let partialCriteria = {
                    creditCardNumber: {
                      startsWith: "5105",
                      endsWith: "100",
                    },
                  };

                  let multipleValueCriteria = {
                    createdUsing: Transaction.CreatedUsing.FullInformation,
                    creditCardCardType: CreditCard.CardType.MasterCard,
                    creditCardCustomerLocation: CreditCard.CustomerLocation.US,
                    merchantAccountId: "sandbox_credit_card",
                    status: Transaction.Status.Settled,
                    source: Transaction.Source.Api,
                    type: Transaction.Type.Sale,
                    user: "integration_user_public_id",
                  };

                  let keyValueCriteria = { refund: false };

                  let today = new Date();
                  let yesterday = new Date();
                  let tomorrow = new Date();

                  yesterday.setDate(today.getDate() - 1);
                  tomorrow.setDate(today.getDate() + 1);

                  let rangeCriteria = {
                    amount: {
                      min: 4.99,
                      max: 5.01,
                    },
                    createdAt: {
                      min: yesterday,
                      max: tomorrow,
                    },
                    authorizedAt: {
                      min: yesterday,
                      max: tomorrow,
                    },
                    settledAt: {
                      min: yesterday,
                      max: tomorrow,
                    },
                    submittedForSettlementAt: {
                      min: yesterday,
                      max: tomorrow,
                    },
                  };

                  // eslint-disable-next-line func-style
                  let search = function (search) {
                    let operator, value;

                    for (let criteria in textCriteria) {
                      if (!textCriteria.hasOwnProperty(criteria)) {
                        continue;
                      }
                      value = textCriteria[criteria];
                      search[criteria]().is(value);
                    }

                    for (let criteria in partialCriteria) {
                      if (!partialCriteria.hasOwnProperty(criteria)) {
                        continue;
                      }
                      let partial = partialCriteria[criteria];

                      for (operator in partial) {
                        if (!partial.hasOwnProperty(operator)) {
                          continue;
                        }
                        if (!partial.hasOwnProperty(operator)) {
                          continue;
                        }
                        value = partial[operator];
                        search[criteria]()[operator](value);
                      }
                    }

                    for (let criteria in multipleValueCriteria) {
                      if (!multipleValueCriteria.hasOwnProperty(criteria)) {
                        continue;
                      }
                      if (!multipleValueCriteria.hasOwnProperty(criteria)) {
                        continue;
                      }
                      value = multipleValueCriteria[criteria];
                      search[criteria]().in(value);
                    }

                    for (let criteria in keyValueCriteria) {
                      if (!keyValueCriteria.hasOwnProperty(criteria)) {
                        continue;
                      }
                      if (!keyValueCriteria.hasOwnProperty(criteria)) {
                        continue;
                      }
                      value = keyValueCriteria[criteria];
                      search[criteria]().is(value);
                    }

                    return (() => {
                      let result = [];

                      for (let criteria in rangeCriteria) {
                        if (!rangeCriteria.hasOwnProperty(criteria)) {
                          continue;
                        }
                        if (!rangeCriteria.hasOwnProperty(criteria)) {
                          continue;
                        }

                        let range = rangeCriteria[criteria];

                        result.push(
                          (() => {
                            let result1 = [];

                            for (operator in range) {
                              if (!range.hasOwnProperty(operator)) {
                                continue;
                              }
                              if (!range.hasOwnProperty(operator)) {
                                continue;
                              }

                              value = range[operator];
                              result1.push(search[criteria]()[operator](value));
                            }

                            return result1;
                          })()
                        );
                      }

                      return result;
                    })();
                  };

                  specHelper.defaultGateway.transaction.search(
                    search,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isObject(response);
                      assert.isTrue(response.success);
                      assert.equal(response.length(), 1);

                      return response.first(function (err, transaction) {
                        assert.isNull(err);
                        assert.isObject(transaction);

                        done();
                      });
                    }
                  );
                }
              )
          )
      );
    });

    it("finds paypal transactions", function (done) {
      let transactionParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.PayPalBillingAgreement,
        options: {
          submitForSettlement: true,
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.testing.settle(
            response.transaction.id,
            () =>
              specHelper.defaultGateway.transaction.find(
                response.transaction.id,
                function (err, transaction) {
                  // eslint-disable-next-line func-style
                  let search = function (search) {
                    search.paypalPayerEmail().is(transaction.paypal.payerEmail);
                    search.paypalPaymentId().is(transaction.paypal.paymentId);

                    return search
                      .paypalAuthorizationId()
                      .is(transaction.paypal.authorizationId);
                  };

                  specHelper.defaultGateway.transaction.search(
                    search,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);
                      assert.equal(response.length(), 1);

                      return response.first(function (err, transaction) {
                        assert.isObject(transaction);
                        assert.isNull(err);

                        done();
                      });
                    }
                  );
                }
              )
          )
      );
    });

    it("finds Meta Checkout transactions", function (done) {
      let cardParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.MetaCheckoutCard,
        options: {
          submitForSettlement: true,
        },
      };

      let tokenParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.MetaCheckoutToken,
        options: {
          submitForSettlement: true,
        },
      };

      // eslint-disable-next-line func-style
      let search = function (search) {
        return search.paymentInstrumentType().is("MetaCheckout");
      };

      specHelper.defaultGateway.transaction.sale(
        cardParams,
        (err, response) => {
          assert.isNull(err);
          assert.isTrue(response.success);

          let cardTxId = response.transaction.id;

          specHelper.defaultGateway.transaction.sale(
            tokenParams,
            (err, response) => {
              assert.isNull(err);
              assert.isTrue(response.success);

              let tokenTxId = response.transaction.id;

              specHelper.defaultGateway.transaction.search(
                search,
                function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);

                  assert.isTrue(response.length() >= 2);
                  assert.isTrue(response.ids.includes(cardTxId));
                  assert.isTrue(response.ids.includes(tokenTxId));

                  done();
                }
              );
            }
          );
        }
      );
    });

    it("finds sepa direct debit transactions", function (done) {
      let transactionParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.SepaDirectDebit,
        options: {
          submitForSettlement: true,
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.testing.settle(
            response.transaction.id,
            () => {
              // eslint-disable-next-line func-style
              let search = function (search) {
                let details =
                  response.transaction.sepaDirectDebitAccountDetails;

                return search
                  .sepaDebitPaypalV2_OrderId()
                  .is(details.paypalV2OrderId || "");
              };

              specHelper.defaultGateway.transaction.search(
                search,
                function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);

                  return response.first(function (err, transaction) {
                    assert.isObject(transaction);
                    assert.equal(
                      transaction.paymentInstrumentType,
                      "sepa_debit_account"
                    );
                    assert.isNull(err);

                    done();
                  });
                }
              );
            }
          )
      );
    });

    xit("pages correctly (slow test)", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "13.19",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };
      let counter = 0;

      __range__(1, 51, true).forEach(() =>
        specHelper.defaultGateway.transaction.sale(
          transactionParams,
          function () {
            counter += 1;
            if (counter === 51) {
              specHelper.defaultGateway.transaction.search(
                (search) => search.orderId().is(random),
                function (err, response) {
                  let transactions = {};

                  let responseCounter = 0;

                  response.each(function (err, transaction) {
                    if (transactions[transaction.id]) {
                      assert.equal(transaction.id, 0);
                    }
                    transactions[transaction.id] = true;
                    responseCounter += 1;

                    if (
                      Object.keys(transactions).length !== responseCounter ||
                      responseCounter === 51
                    ) {
                      assert.equal(
                        Object.keys(transactions).length,
                        responseCounter
                      );
                      done();
                    }
                  });
                }
              );
            }
          }
        )
      );
    });

    it("returns multiple results", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.sale(transactionParams, () =>
          specHelper.defaultGateway.transaction.search(
            (search) => search.orderId().is(random),
            function (err, response) {
              let transactions = [];

              response.each(function (err, transaction) {
                transactions.push(transaction);

                if (transactions.length === 2) {
                  assert.equal(transactions.length, 2);
                  assert.equal(transactions[0].orderId, random);
                  assert.equal(transactions[1].orderId, random);

                  done();
                }
              });
            }
          )
        )
      );
    });

    it("allows stream style integration of results", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.sale(
          transactionParams,
          function () {
            let transactions = [];

            let search = specHelper.defaultGateway.transaction.search(
              (search) => search.orderId().is(random)
            );

            search.on("data", (transaction) => transactions.push(transaction));

            search.on("end", function () {
              assert.equal(transactions.length, 2);
              assert.equal(transactions[0].orderId, random);
              assert.equal(transactions[1].orderId, random);

              done();
            });

            return search.resume();
          }
        )
      );
    });

    it("allows checking length on streams on the ready event", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.sale(
          transactionParams,
          function () {
            let search = specHelper.defaultGateway.transaction.search(
              (search) => search.orderId().is(random)
            );

            return search.on("ready", function () {
              assert.equal(search.searchResponse.length(), 2);

              done();
            });
          }
        )
      );
    });

    it("allows piping results to a writable stream", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.sale(
          transactionParams,
          function () {
            let transactions = [];

            let ws = Writable({ objectMode: true }); // eslint-disable-line new-cap

            ws._write = function (chunk, enc, next) {
              transactions.push(chunk);

              return next();
            };

            let search = specHelper.defaultGateway.transaction.search(
              (search) => search.orderId().is(random)
            );

            ws.on("finish", function () {
              assert.equal(transactions.length, 2);
              assert.equal(transactions[0].orderId, random);
              assert.equal(transactions[1].orderId, random);
              done();
            });

            return search.pipe(ws);
          }
        )
      );
    });

    it("emits error events when appropriate", function (done) {
      let search = specHelper.defaultGateway.transaction.search((search) =>
        search.amount().is(-10)
      );

      let error;

      search.on("error", (err) => {
        error = err;
      });

      search.on("data", function () {});

      return search.on("end", function () {
        assert.equal(error.type, braintree.errorTypes.unexpectedError);

        done();
      });
    });

    it("can find transactions by disbursement date", function (done) {
      let yesterday = new Date("April 9, 2013");
      let tomorrow = new Date("April 11, 2013");

      // eslint-disable-next-line func-style
      let search = function (s) {
        s.id().is("deposittransaction");
        s.disbursementDate().min(yesterday);

        return s.disbursementDate().max(tomorrow);
      };

      specHelper.defaultGateway.transaction.search(
        search,
        function (err, response) {
          let transactions = [];

          response.each(function (err, transaction) {
            transactions.push(transaction);

            if (transactions.length === 1) {
              assert.equal(transactions.length, 1);
              assert.equal(
                transactions[0].disbursementDetails.disbursementDate,
                "2013-04-10"
              );

              done();
            }
          });
        }
      );
    });

    it("can find transactions by dispute date", function (done) {
      let transactionParams = {
        amount: "10.00",
        creditCard: {
          number: CreditCardNumbers.Dispute.Chargeback,
          expirationDate: "03/2018",
        },
      };

      let today = new Date();

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) => {
          let checkForTransaction = setInterval(function () {
            specHelper.defaultGateway.transaction.search(
              function (search) {
                search.id().is(response.transaction.id);
                search.disputeDate().min(today);

                return search.disputeDate().max(today);
              },
              function (err, response) {
                if (response.length() === 0) {
                  return;
                }
                assert.equal(1, response.length());
                clearInterval(checkForTransaction);
                done();
              }
            );
          }, 1000);
        }
      );
    });

    it("searches on credit card type elo", function (done) {
      let transactionParams = {
        amount: "10.00",
        merchantAccountId: "adyen_ma",
        creditCard: {
          number: "5066991111111118",
          expirationDate: "10/2020",
          cvv: "737",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.transaction.search(
            function (search) {
              search.creditCardCardType().is("Elo");

              return search.id().is(response.transaction.id);
            },
            function (err, response) {
              assert.equal(1, response.length());
              done();
            }
          )
      );
    });

    it("searches on payment instrument type credit_card", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.transaction.search(
            function (search) {
              search.paymentInstrumentType().is("CreditCardDetail");

              return search.id().is(response.transaction.id);
            },
            function (err, response) {
              assert.equal(1, response.length());
              done();
            }
          )
      );
    });

    it("searches on payment instrument type paypal", function (done) {
      let transactionParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.PayPalFuturePayment,
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.transaction.search(
            function (search) {
              search.id().is(response.transaction.id);

              return search.paymentInstrumentType().is("PayPalDetail");
            },
            function (err, response) {
              assert.equal(1, response.length());
              done();
            }
          )
      );
    });

    it("searches on payment instrument type local payment", function (done) {
      let transactionParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        options: {
          submitForSettlement: true,
        },
        paymentMethodNonce: Braintree.Test.Nonces.LocalPayment,
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.transaction.search(
            function (search) {
              search.id().is(response.transaction.id);

              return search.paymentInstrumentType().is("LocalPaymentDetail");
            },
            function (err, response) {
              assert.equal(1, response.length());
              done();
            }
          )
      );
    });

    it("searches on payment instrument type apple pay", function (done) {
      let transactionParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.ApplePayVisa,
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.transaction.search(
            function (search) {
              search.id().is(response.transaction.id);

              return search.paymentInstrumentType().is("ApplePayDetail");
            },
            function (err, response) {
              assert.equal(1, response.length());
              done();
            }
          )
      );
    });

    it("returns settlement_confirmed transaction", function (done) {
      let transactionId = "settlement_confirmed_txn";

      // eslint-disable-next-line func-style
      let search = function (s) {
        return s.id().is(transactionId);
      };

      specHelper.defaultGateway.transaction.search(
        search,
        function (err, response) {
          let transactions = [];

          response.each(function (err, transaction) {
            transactions.push(transaction);

            if (transactions.length === 1) {
              assert.equal(transactions.length, 1);
              assert.equal(transactions[0].id, transactionId);

              done();
            }
          });
        }
      );
    });

    it("searches on store ids", function (done) {
      let transactionId = "contact_visa_transaction";

      // eslint-disable-next-line func-style
      let search = function (s) {
        s.id().is("contact_visa_transaction");

        return s.storeIds().in("store-id");
      };

      specHelper.defaultGateway.transaction.search(
        search,
        function (err, response) {
          let transactions = [];

          response.each(function (err, transaction) {
            transactions.push(transaction);

            if (transactions.length === 1) {
              assert.equal(transactions.length, 1);
              assert.equal(transactions[0].id, transactionId);

              done();
            }
          });
        }
      );
    });

    it("searches on store ids", function (done) {
      let transactionId = "contact_visa_transaction";

      // eslint-disable-next-line func-style
      let search = function (s) {
        s.id().is("contact_visa_transaction");

        return s.storeIds().is("store-id");
      };

      specHelper.defaultGateway.transaction.search(
        search,
        function (err, response) {
          let transactions = [];

          response.each(function (err, transaction) {
            transactions.push(transaction);

            if (transactions.length === 1) {
              assert.equal(transactions.length, 1);
              assert.equal(transactions[0].id, transactionId);

              done();
            }
          });
        }
      );
    });

    it("searches on reason code", function (done) {
      let transactionId = "ach_txn_ret1";
      let reasonCode = "R01";

      // eslint-disable-next-line func-style
      let search = function (s) {
        s.id().is(transactionId);

        return s.reasonCode().is(reasonCode);
      };

      specHelper.defaultGateway.transaction.search(
        search,
        function (err, response) {
          let transactions = [];

          response.each(function (err, transaction) {
            transactions.push(transaction);

            if (transactions.length === 1) {
              assert.equal(transactions.length, 1);
              assert.equal(transactions[0].id, transactionId);

              done();
            }
          });
        }
      );
    });

    it("searches on reason codes", function (done) {
      let transactionId = "ach_txn_ret2";

      let reasonCode = ["R01", "R02"];

      // eslint-disable-next-line func-style
      let search = function (s) {
        s.id().is(transactionId);

        return s.reasonCode().in(reasonCode);
      };

      specHelper.defaultGateway.transaction.search(
        search,
        function (err, response) {
          let transactions = [];

          response.each(function (err, transaction) {
            transactions.push(transaction);

            if (transactions.length === 1) {
              assert.equal(transactions.length, 1);
              assert.equal(transactions[0].id, transactionId);

              done();
            }
          });
        }
      );
    });

    it("searches on reason code any", function (done) {
      let reasonCode = "any_reason_code";

      // eslint-disable-next-line func-style
      let search = function (s) {
        return s.reasonCode().is(reasonCode);
      };

      specHelper.defaultGateway.transaction.search(
        search,
        function (err, response) {
          let transactions = [];

          response.each(function (err, transaction) {
            transactions.push(transaction);

            if (transactions.length === 2) {
              assert.equal(transactions.length, 2);

              done();
            }
          });
        }
      );
    });

    it("it finds records within date range of the custom field", function (done) {
      let today = new Date();
      let yesterday = new Date();
      let tomorrow = new Date();

      yesterday.setDate(today.getDate() - 1);
      tomorrow.setDate(today.getDate() + 1);

      // eslint-disable-next-line func-style
      let search = function () {
        return {
          achReturnResponsesCreatedAt: {
            min: yesterday,
            max: tomorrow,
          },
        };
      };

      specHelper.defaultGateway.transaction.search(
        search,
        function (err, response) {
          let transactions = [];

          response.each(function (err, transaction) {
            transactions.push(transaction);

            if (transactions.length === 2) {
              assert.equal(transactions.length, 2);

              done();
            }
          });
        }
      );
    });

    it("filters on valid merchant account ids", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.transaction.search(
            function (search) {
              search
                .merchantAccountId()
                .is(response.transaction.merchantAccountId);

              return search.id().is(response.transaction.id);
            },
            function (err, response) {
              assert.equal(1, response.length());
              done();
            }
          )
      );
    });

    it("filters on valid and invalid merchant account ids", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.transaction.search(
            function (search) {
              search
                .merchantAccountId()
                .in(
                  response.transaction.merchantAccountId,
                  "invalid_merchant_acct_id"
                );

              return search.id().is(response.transaction.id);
            },
            function (err, response) {
              assert.equal(1, response.length());
              done();
            }
          )
      );
    });

    it("filters out invalid merchant account ids", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) =>
          specHelper.defaultGateway.transaction.search(
            function (search) {
              search.merchantAccountId().is("invalid_merchant_acct_id");

              return search.id().is(response.transaction.id);
            },
            function (err, response) {
              assert.equal(0, response.length());
              done();
            }
          )
      );
    });

    it("raises Unexpected Error for search timeouts", (done) =>
      specHelper.defaultGateway.transaction.search(
        (search) => search.amount().is(-10),
        function (err) {
          assert.equal(err.type, braintree.errorTypes.unexpectedError);

          done();
        }
      ));

    it("can call lineitems method on transaction object", (done) => {
      let li = [
        {
          quantity: "1.0232",
          name: "Name #1",
          kind: "debit",
          unitAmount: "45.1232",
          totalAmount: "45.15",
        },
      ];
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "01/2015",
        },
        lineItems: li,
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.search(
          (search) => search.orderId().is(random),
          function (err, response) {
            response.each(function (err, transaction) {
              transaction.lineItems((err, lineItems) => {
                assert.equal(li[0].name, lineItems[0].name);
                assert.equal(li[0].totalAmount, lineItems[0].totalAmount);
                done();
              });
            });
          }
        )
      );
    });

    it("verify retried_transaction_id on transaction object", (done) => {
      let transactionParams = {
        amount: "2000.00",
        paymentMethodToken: "network_tokenized_credit_card",
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, saleResponse) => {
          let retryId = saleResponse.transaction.retryIds[0];

          specHelper.defaultGateway.transaction.search(
            function (search) {
              search.id().is(retryId);

              return search.amount().is("2000.00");
            },
            function (err, response) {
              if (response.length() === 0) {
                return;
              }

              response.first(function (err, transaction) {
                assert.equal(retryId, transaction.id);
                assert.isNotNull(transaction.retriedTransactionId);
                done();
              });
            }
          );
        }
      );
    });

    it("can search by debitNetwork", function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: "10.00",
        orderId: random,
        paymentMethodNonce: Nonces.TransactablePinlessDebitVisa,
        merchantAccountId: "pinless_debit",
        options: {
          submitForSettlement: true,
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) => {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, "sale");
          assert.equal(response.transaction.amount, "10.00");
          assert.equal(
            response.transaction.debitNetwork,
            CreditCard.DebitNetwork.Nyce
          );

          return specHelper.defaultGateway.transaction.search(
            function (search) {
              search.debitNetwork().is(CreditCard.DebitNetwork.Nyce);

              return search.id().is(response.transaction.id);
            },
            function (err, response) {
              assert.equal(1, response.ids.length);
              done();
            }
          );
        }
      );
    });
  }));

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1; // eslint-disable-line no-nested-ternary

  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }

  return range;
}
