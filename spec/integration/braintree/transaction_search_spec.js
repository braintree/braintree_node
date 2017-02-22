'use strict';

let Braintree = require('../../../lib/braintree');
let _ = require('underscore');
let Transaction = Braintree.Transaction;
let CreditCard = Braintree.CreditCard;
let Util = require('../../../lib/braintree/util').Util;
let Writable = require('stream').Writable;
let braintree = specHelper.braintree;

describe('TransactionSearch', () =>
  describe('search', function () {
    it('finds transactions', function (done) {
      let firstName = `Tom_${specHelper.randomId()}`;
      let cardToken = `card_${specHelper.randomId()}`;
      let customerId = `customer_${specHelper.randomId()}`;

      let transactionParams = {
        billing: {
          company: 'Braintree',
          countryName: 'US',
          extendedAddress: 'Apt B',
          firstName,
          lastName: 'Guy',
          locality: 'Chicago',
          postalCode: '60646',
          region: 'IL',
          streetAddress: '123 Fake St'
        },
        shipping: {
          company: 'Braintree',
          countryName: 'United States of America',
          extendedAddress: 'Apt B',
          firstName,
          lastName: 'Guy',
          locality: 'Chicago',
          postalCode: '60646',
          region: 'IL',
          streetAddress: '123 Fake St'
        },
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2012',
          cardholderName: 'Tom Guy',
          token: cardToken
        },
        customer: {
          id: customerId,
          company: 'Braintree',
          email: 'tom@example.com',
          fax: '(123)456-7890',
          firstName,
          lastName: 'Guy',
          phone: '(456)123-7890',
          website: 'http://www.example.com/'
        },
        orderId: '123',
        options: {
          storeInVault: true,
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.testing.settle(response.transaction.id, () =>
          specHelper.defaultGateway.transaction.find(response.transaction.id, function (err, transaction) {
            let textCriteria = {
              billingCompany: 'Braintree',
              billingCountryName: 'United States of America',
              billingExtendedAddress: 'Apt B',
              billingFirstName: firstName,
              billingLastName: 'Guy',
              billingLocality: 'Chicago',
              billingPostalCode: '60646',
              billingRegion: 'IL',
              billingStreetAddress: '123 Fake St',
              creditCardCardholderName: 'Tom Guy',
              currency: 'USD',
              customerCompany: 'Braintree',
              customerEmail: 'tom@example.com',
              customerFax: '(123)456-7890',
              customerFirstName: firstName,
              customerId,
              customerLastName: 'Guy',
              customerPhone: '(456)123-7890',
              customerWebsite: 'http://www.example.com/',
              id: transaction.id,
              orderId: '123',
              paymentMethodToken: cardToken,
              processorAuthorizationCode: transaction.processorAuthorizationCode,
              settlementBatchId: transaction.settlementBatchId,
              shippingCompany: 'Braintree',
              shippingCountryName: 'United States of America',
              shippingExtendedAddress: 'Apt B',
              shippingFirstName: firstName,
              shippingLastName: 'Guy',
              shippingLocality: 'Chicago',
              shippingPostalCode: '60646',
              shippingRegion: 'IL',
              shippingStreetAddress: '123 Fake St',
              creditCardExpirationDate: '05/2012',
              creditCardUniqueIdentifier: transaction.creditCard.uniqueNumberIdentifier
            };

            let partialCriteria = {
              creditCardNumber: {
                startsWith: '5105',
                endsWith: '100'
              }
            };

            let multipleValueCriteria = {
              createdUsing: Transaction.CreatedUsing.FullInformation,
              creditCardCardType: CreditCard.CardType.MasterCard,
              creditCardCustomerLocation: CreditCard.CustomerLocation.US,
              merchantAccountId: 'sandbox_credit_card',
              status: Transaction.Status.Settled,
              source: Transaction.Source.Api,
              type: Transaction.Type.Sale,
              user: 'integration_user_public_id'
            };

            let keyValueCriteria =
              {refund: false};

            let today = new Date();
            let yesterday = new Date();
            let tomorrow = new Date();

            yesterday.setDate(today.getDate() - 1);
            tomorrow.setDate(today.getDate() + 1);

            let rangeCriteria = {
              amount: {
                min: 4.99,
                max: 5.01
              },
              createdAt: {
                min: yesterday,
                max: tomorrow
              },
              authorizedAt: {
                min: yesterday,
                max: tomorrow
              },
              settledAt: {
                min: yesterday,
                max: tomorrow
              },
              submittedForSettlementAt: {
                min: yesterday,
                max: tomorrow
              }
            };

            let search = function (search) { // eslint-disable-line func-style
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
                  if (!rangeCriteria.hasOwnProperty(criteria)) { continue; }

                  let range = rangeCriteria[criteria];

                  result.push((() => { // eslint-disable-line no-loop-func
                    let result1 = [];

                    for (operator in range) {
                      if (!range.hasOwnProperty(operator)) {
                        continue;
                      }
                      if (!range.hasOwnProperty(operator)) { continue; }

                      value = range[operator];
                      result1.push(search[criteria]()[operator](value));
                    }
                    return result1;
                  })());
                }
                return result;
              })();
            };

            specHelper.defaultGateway.transaction.search(search, function (err, response) {
              assert.isNull(err);
              assert.isObject(response);
              assert.isTrue(response.success);
              assert.equal(response.length(), 1);

              return response.first(function (err, transaction) {
                assert.isNull(err);
                assert.isObject(transaction);

                done();
              });
            });
          })
        )
      );
    });

    it('finds paypal transactions', function (done) {
      let transactionParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.PayPalFuturePayment,
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.testing.settle(response.transaction.id, () =>
          specHelper.defaultGateway.transaction.find(response.transaction.id, function (err, transaction) {
            let search = function (search) { // eslint-disable-line func-style
              search.paypalPayerEmail().is(transaction.paypal.payerEmail);
              search.paypalPaymentId().is(transaction.paypal.paymentId);
              return search.paypalAuthorizationId().is(transaction.paypal.authorizationId);
            };

            specHelper.defaultGateway.transaction.search(search, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.length(), 1);

              return response.first(function (err, transaction) {
                assert.isObject(transaction);
                assert.isNull(err);

                done();
              });
            });
          })
        )
      );
    });

    xit('pages correctly (slow test)', function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: '13.19',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };
      let counter = 0;

      _.each(__range__(1, 51, true), () =>
        specHelper.defaultGateway.transaction.sale(transactionParams, function () {
          counter += 1;
          if (counter === 51) {
            specHelper.defaultGateway.transaction.search(search => search.orderId().is(random), function (err, response) {
              let transactions = {};

              let responseCounter = 0;

              response.each(function (err, transaction) {
                if (transactions[transaction.id]) {
                  assert.equal(transaction.id, 0);
                }
                transactions[transaction.id] = true;
                responseCounter += 1;

                if (_.size(transactions) !== responseCounter || responseCounter === 51) {
                  assert.equal(_.size(transactions), responseCounter);
                  done();
                }
              });
            });
          }
        })
      );
    });

    it('returns multiple results', function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: '10.00',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.sale(transactionParams, () =>
          specHelper.defaultGateway.transaction.search(search => search.orderId().is(random), function (err, response) {
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
          })
        )
      );
    });

    it('allows stream style interation of results', function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: '10.00',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.sale(transactionParams, function () {
          let transactions = [];

          let search = specHelper.defaultGateway.transaction.search(search => search.orderId().is(random));

          search.on('data', transaction => transactions.push(transaction));

          search.on('end', function () {
            assert.equal(transactions.length, 2);
            assert.equal(transactions[0].orderId, random);
            assert.equal(transactions[1].orderId, random);

            done();
          });

          return search.resume();
        })
      );
    });

    it('allows checking length on streams on the ready event', function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: '10.00',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.sale(transactionParams, function () {
          let search = specHelper.defaultGateway.transaction.search(search => search.orderId().is(random));

          return search.on('ready', function () {
            assert.equal(search.searchResponse.length(), 2);

            done();
          });
        })
      );
    });

    it('allows piping results to a writable stream', function (done) {
      if (!Util.supportsStreams2()) {
        done();
        return;
      }

      let random = specHelper.randomId();
      let transactionParams = {
        amount: '10.00',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, () =>
        specHelper.defaultGateway.transaction.sale(transactionParams, function () {
          let transactions = [];

          let ws = Writable({objectMode: true}); // eslint-disable-line new-cap

          ws._write = function (chunk, enc, next) {
            transactions.push(chunk);
            return next();
          };

          let search = specHelper.defaultGateway.transaction.search(search => search.orderId().is(random));

          ws.on('finish', function () {
            assert.equal(transactions.length, 2);
            assert.equal(transactions[0].orderId, random);
            assert.equal(transactions[1].orderId, random);
            done();
          });

          return search.pipe(ws);
        })
      );
    });

    it('emits error events when appropriate', function (done) {
      let search = specHelper.defaultGateway.transaction.search(search => search.amount().is(-10));

      let error = null;

      search.on('error', err => {
        error = err;
      });

      search.on('data', function () {});

      return search.on('end', function () {
        assert.equal(error.type, braintree.errorTypes.downForMaintenanceError);

        done();
      });
    });

    it('can find transactions by disbursement date', function (done) {
      let yesterday = new Date('April 9, 2013');
      let tomorrow = new Date('April 11, 2013');

      let search = function (s) { // eslint-disable-line func-style
        s.id().is('deposittransaction');
        s.disbursementDate().min(yesterday);
        return s.disbursementDate().max(tomorrow);
      };

      specHelper.defaultGateway.transaction.search(search, function (err, response) {
        let transactions = [];

        response.each(function (err, transaction) {
          transactions.push(transaction);

          if (transactions.length === 1) {
            assert.equal(transactions.length, 1);
            assert.equal(transactions[0].disbursementDetails.disbursementDate, '2013-04-10');

            done();
          }
        });
      });
    });

    it('can find transactions by dispute date', function (done) {
      let yesterday = new Date('March 1, 2014');
      let tomorrow = new Date('March 2, 2014');

      let search = function (s) { // eslint-disable-line func-style
        s.id().is('disputedtransaction');
        s.disputeDate().min(yesterday);
        return s.disputeDate().max(tomorrow);
      };

      specHelper.defaultGateway.transaction.search(search, function (err, response) {
        let transactions = [];

        response.each(function (err, transaction) {
          transactions.push(transaction);

          if (transactions.length === 1) {
            assert.equal(transactions.length, 1);
            assert.equal(transactions[0].disputes[0].receivedDate, '2014-03-01');

            done();
          }
        });
      });
    });

    it('searches on payment instrument type credit_card', function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: '10.00',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.search(function (search) {
          search.paymentInstrumentType().is('CreditCardDetail');
          return search.id().is(response.transaction.id);
        }, function (err, response) {
          assert.equal(1, response.length());
          done();
        })
      );
    });

    it('searches on payment instrument type paypal', function (done) {
      let transactionParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.PayPalFuturePayment
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.search(function (search) {
          search.id().is(response.transaction.id);
          return search.paymentInstrumentType().is('PayPalDetail');
        }, function (err, response) {
          assert.equal(1, response.length());
          done();
        })
      );
    });

    it('searches on payment instrument type apple pay', function (done) {
      let transactionParams = {
        amount: Braintree.Test.TransactionAmounts.Authorize,
        paymentMethodNonce: Braintree.Test.Nonces.ApplePayVisa
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.search(function (search) {
          search.id().is(response.transaction.id);
          return search.paymentInstrumentType().is('ApplePayDetail');
        }, function (err, response) {
          assert.equal(1, response.length());
          done();
        })
      );
    });

    it('filters on valid merchant account ids', function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: '10.00',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.search(function (search) {
          search.merchantAccountId().is(response.transaction.merchantAccountId);
          return search.id().is(response.transaction.id);
        }, function (err, response) {
          assert.equal(1, response.length());
          done();
        })
      );
    });

    it('filters on valid and invalid merchant account ids', function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: '10.00',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.search(function (search) {
          search.merchantAccountId().in(response.transaction.merchantAccountId, 'invalid_merchant_acct_id');
          return search.id().is(response.transaction.id);
        }, function (err, response) {
          assert.equal(1, response.length());
          done();
        })
      );
    });

    it('filters out invalid merchant account ids', function (done) {
      let random = specHelper.randomId();
      let transactionParams = {
        amount: '10.00',
        orderId: random,
        creditCard: {
          number: '4111111111111111',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.search(function (search) {
          search.merchantAccountId().is('invalid_merchant_acct_id');
          return search.id().is(response.transaction.id);
        }, function (err, response) {
          assert.equal(0, response.length());
          done();
        })
      );
    });

    it('raises Down For Maintenance Error for search timeouts', done =>
      specHelper.defaultGateway.transaction.search(search => search.amount().is(-10), function (err) {
        assert.equal(err.type, braintree.errorTypes.downForMaintenanceError);

        done();
      })
    );
  })
);

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1; // eslint-disable-line no-nested-ternary

  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
