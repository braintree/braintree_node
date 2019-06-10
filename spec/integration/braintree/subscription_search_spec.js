'use strict';

let Braintree = require('../../../lib/braintree');
let Subscription = Braintree.Subscription;

describe('SubscriptionSearch', () =>
  describe('search', function () {
    it('returns search results', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        specHelper.defaultGateway.subscription.create(subscriptionParams, function (err, response) {
          let subscriptionId = response.subscription.id;
          let textCriteria = {
            id: subscriptionParams.id,
            transactionId: response.subscription.transactions[0].id
          };

          let multipleValueCriteria = {
            inTrialPeriod: false,
            status: Subscription.Status.Active,
            merchantAccountId: 'sandbox_credit_card',
            ids: subscriptionParams.id
          };

          let multipleValueOrTextCriteria =
            {planId: specHelper.plans.trialless.id};

          let planPrice = Number(specHelper.plans.trialless.price);
          let today = new Date();
          let yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
          let tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
          let billingCyclesRemaining = Number(response.subscription.numberOfBillingCycles) - 1;

          let rangeCriteria = {
            price: {
              min: planPrice - 1,
              max: planPrice + 1
            },
            billingCyclesRemaining: {
              min: billingCyclesRemaining,
              max: billingCyclesRemaining
            },
            nextBillingDate: {
              min: today
            },
            createdAt: {
              min: yesterday,
              max: tomorrow
            }
          };

          let search = function (search) { // eslint-disable-line func-style
            let value;

            for (let criteria in textCriteria) {
              if (!textCriteria.hasOwnProperty(criteria)) {
                continue;
              }
              if (!textCriteria.hasOwnProperty(criteria)) {
                continue;
              }
              value = textCriteria[criteria];
              search[criteria]().is(value);
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

            for (let criteria in multipleValueOrTextCriteria) {
              if (!multipleValueOrTextCriteria.hasOwnProperty(criteria)) {
                continue;
              }
              if (!multipleValueOrTextCriteria.hasOwnProperty(criteria)) {
                continue;
              }
              value = multipleValueOrTextCriteria[criteria];
              search[criteria]().startsWith(value);
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

                result.push((() => { // eslint-disable-line no-loop-func
                  let result1 = [];

                  for (let operator in range) {
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
                })());
              }

              return result;
            })();
          };

          specHelper.defaultGateway.subscription.search(search, function (err, response) {
            assert.isTrue(response.success);
            assert.equal(response.length(), 1);

            return response.first(function (err, subscription) {
              assert.isObject(subscription);
              assert.equal(subscription.id, subscriptionId);
              assert.isNull(err);

              done();
            });
          });
        });
      });
    });

    it('does not return search results for out of range created_at parameters', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        specHelper.defaultGateway.subscription.create(subscriptionParams, function (err, response) {
          let textCriteria = {
            id: subscriptionParams.id,
            transactionId: response.subscription.transactions[0].id
          };

          let multipleValueCriteria = {
            inTrialPeriod: false,
            status: Subscription.Status.Active,
            merchantAccountId: 'sandbox_credit_card',
            ids: subscriptionParams.id
          };

          let multipleValueOrTextCriteria =
            {planId: specHelper.plans.trialless.id};

          let planPrice = Number(specHelper.plans.trialless.price);
          let today = new Date();
          let tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
          let dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
          let billingCyclesRemaining = Number(response.subscription.numberOfBillingCycles) - 1;

          let rangeCriteria = {
            price: {
              min: planPrice - 1,
              max: planPrice + 1
            },
            billingCyclesRemaining: {
              min: billingCyclesRemaining,
              max: billingCyclesRemaining
            },
            nextBillingDate: {
              min: today
            },
            createdAt: {
              min: tomorrow,
              max: dayAfterTomorrow
            }
          };

          let search = function (search) { // eslint-disable-line func-style
            let value;

            for (let criteria in textCriteria) {
              if (!textCriteria.hasOwnProperty(criteria)) {
                continue;
              }
              if (!textCriteria.hasOwnProperty(criteria)) {
                continue;
              }
              value = textCriteria[criteria];
              search[criteria]().is(value);
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

            for (let criteria in multipleValueOrTextCriteria) {
              if (!multipleValueOrTextCriteria.hasOwnProperty(criteria)) {
                continue;
              }
              if (!multipleValueOrTextCriteria.hasOwnProperty(criteria)) {
                continue;
              }
              value = multipleValueOrTextCriteria[criteria];
              search[criteria]().startsWith(value);
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

                result.push((() => { // eslint-disable-line no-loop-func
                  let result1 = [];

                  for (let operator in range) {
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
                })());
              }

              return result;
            })();
          };

          specHelper.defaultGateway.subscription.search(search, function (err, response) {
            assert.isTrue(response.success);
            assert.equal(response.length(), 0);

            done();
          });
        });
      });
    });

    it('allows stream style interation of results', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        specHelper.defaultGateway.subscription.create(subscriptionParams, function (err, response) {
          let subscriptionId = response.subscription.id;

          let subscriptions = [];

          let search = specHelper.defaultGateway.subscription.search(search => search.id().is(subscriptionId));

          search.on('data', subscription => subscriptions.push(subscription));

          search.on('end', function () {
            assert.equal(subscriptions.length, 1);
            assert.equal(subscriptions[0].id, subscriptionId);

            done();
          });

          return search.resume();
        });
      });
    });

    it('filters on valid merchant account ids', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        specHelper.defaultGateway.subscription.create(subscriptionParams, function () {
          let multipleValueCriteria = {
            merchantAccountId: 'sandbox_credit_card',
            ids: subscriptionParams.id
          };

          let search = search => // eslint-disable-line func-style
            (() => {
              let result = [];

              for (let criteria in multipleValueCriteria) {
                if (!multipleValueCriteria.hasOwnProperty(criteria)) {
                  continue;
                }
                if (!multipleValueCriteria.hasOwnProperty(criteria)) {
                  continue;
                }
                let value = multipleValueCriteria[criteria];

                result.push(search[criteria]().in(value));
              }

              return result;
            })()

          ;

          specHelper.defaultGateway.subscription.search(search, function (err, response) {
            assert.isTrue(response.success);
            assert.equal(1, response.length());
            done();
          });
        });
      });
    });

    it('filters on mixed valid and invalid merchant account ids', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        specHelper.defaultGateway.subscription.create(subscriptionParams, function () {
          let multipleValueCriteria = {
            merchantAccountId: ['sandbox_credit_card', 'invalid_merchant_id'],
            ids: subscriptionParams.id
          };

          let search = search => // eslint-disable-line func-style
            (() => {
              let result = [];

              for (let criteria in multipleValueCriteria) {
                if (!multipleValueCriteria.hasOwnProperty(criteria)) {
                  continue;
                }
                if (!multipleValueCriteria.hasOwnProperty(criteria)) {
                  continue;
                }
                let value = multipleValueCriteria[criteria];

                result.push(search[criteria]().in(value));
              }

              return result;
            })()

          ;

          specHelper.defaultGateway.subscription.search(search, function (err, response) {
            assert.isTrue(response.success);
            assert.equal(1, response.length());
            done();
          });
        });
      });
    });

    it('filters on invalid merchant account ids', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        specHelper.defaultGateway.subscription.create(subscriptionParams, function () {
          let multipleValueCriteria = {
            merchantAccountId: 'invalid_merchant_id',
            ids: subscriptionParams.id
          };

          let search = search => // eslint-disable-line func-style
            (() => {
              let result = [];

              for (let criteria in multipleValueCriteria) {
                if (!multipleValueCriteria.hasOwnProperty(criteria)) {
                  continue;
                }
                if (!multipleValueCriteria.hasOwnProperty(criteria)) {
                  continue;
                }
                let value = multipleValueCriteria[criteria];

                result.push(search[criteria]().in(value));
              }

              return result;
            })()

          ;

          specHelper.defaultGateway.subscription.search(search, function (err, response) {
            assert.isTrue(response.success);
            assert.equal(0, response.length());
            done();
          });
        });
      });
    });
  })
);
