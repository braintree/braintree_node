import Braintree from "../../../lib/braintree";
import "../../spec_helper";
let { Subscription } = Braintree;

describe("SubscriptionSearch", () =>
  describe("search", function() {
    it("returns search results", function(done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        return specHelper.defaultGateway.subscription.create(subscriptionParams, function(err, response) {
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
          let yesterday = new Date(today.getTime() - (24*60*60*1000));
          let tomorrow = new Date(today.getTime() + (24*60*60*1000));
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

          let search = function(search) {
            let value;
            for (var criteria in textCriteria) {
              value = textCriteria[criteria];
              search[criteria]().is(value);
            }

            for (criteria in multipleValueCriteria) {
              value = multipleValueCriteria[criteria];
              search[criteria]().in(value);
            }

            for (criteria in multipleValueOrTextCriteria) {
              value = multipleValueOrTextCriteria[criteria];
              search[criteria]().startsWith(value);
            }

            return (() => {
              let result = [];
              for (criteria in rangeCriteria) {
                var range = rangeCriteria[criteria];
                result.push((() => {
                  let result1 = [];
                  for (let operator in range) {
                    value = range[operator];
                    result1.push(search[criteria]()[operator](value));
                  }
                  return result1;
                })());
              }
              return result;
            })();
          };

          return specHelper.defaultGateway.subscription.search(search, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(response.length(), 1);

            return response.first(function(err, subscription) {
              assert.isObject(subscription);
              assert.equal(subscription.id, subscriptionId);
              assert.isNull(err);

              return done();
            });
          });
        });
      });
    });

    it("does not return search results for out of range created_at parameters", function(done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        return specHelper.defaultGateway.subscription.create(subscriptionParams, function(err, response) {
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
          let tomorrow = new Date(today.getTime() + (24*60*60*1000));
          let dayAfterTomorrow = new Date(today.getTime() + (2*24*60*60*1000));
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

          let search = function(search) {
            let value;
            for (var criteria in textCriteria) {
              value = textCriteria[criteria];
              search[criteria]().is(value);
            }

            for (criteria in multipleValueCriteria) {
              value = multipleValueCriteria[criteria];
              search[criteria]().in(value);
            }

            for (criteria in multipleValueOrTextCriteria) {
              value = multipleValueOrTextCriteria[criteria];
              search[criteria]().startsWith(value);
            }

            return (() => {
              let result = [];
              for (criteria in rangeCriteria) {
                var range = rangeCriteria[criteria];
                result.push((() => {
                  let result1 = [];
                  for (let operator in range) {
                    value = range[operator];
                    result1.push(search[criteria]()[operator](value));
                  }
                  return result1;
                })());
              }
              return result;
            })();
          };

          return specHelper.defaultGateway.subscription.search(search, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(response.length(), 0);

            return done();
          });
        });
      });
    });

    it("allows stream style interation of results", function(done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        return specHelper.defaultGateway.subscription.create(subscriptionParams, function(err, response) {
          let subscriptionId = response.subscription.id;

          let subscriptions = [];

          let search = specHelper.defaultGateway.subscription.search(search => search.id().is(subscriptionId));

          search.on('data', subscription => subscriptions.push(subscription));

          search.on('end', function() {
            assert.equal(subscriptions.length, 1);
            assert.equal(subscriptions[0].id, subscriptionId);

            return done();
          });

          return search.resume();
        });
      });
    });

    it("filters on valid merchant account ids", function(done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        return specHelper.defaultGateway.subscription.create(subscriptionParams, function(err, response) {
          let subscriptionId = response.subscription.id; 

          let multipleValueCriteria = {
            merchantAccountId: 'sandbox_credit_card',
            ids: subscriptionParams.id
          };

          let search = search =>
            (() => {
              let result = [];
              for (let criteria in multipleValueCriteria) {
                let value = multipleValueCriteria[criteria];
                result.push(search[criteria]().in(value));
              }
              return result;
            })()
          ;

          return specHelper.defaultGateway.subscription.search(search, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(1, response.length());
            return done();
          });
        });
      });
    });

    it("filters on mixed valid and invalid merchant account ids", function(done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        return specHelper.defaultGateway.subscription.create(subscriptionParams, function(err, response) {
          let subscriptionId = response.subscription.id; 

          let multipleValueCriteria = {
            merchantAccountId: ['sandbox_credit_card', 'invalid_merchant_id'],
            ids: subscriptionParams.id
          };

          let search = search =>
            (() => {
              let result = [];
              for (let criteria in multipleValueCriteria) {
                let value = multipleValueCriteria[criteria];
                result.push(search[criteria]().in(value));
              }
              return result;
            })()
          ;

          return specHelper.defaultGateway.subscription.search(search, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(1, response.length());
            return done();
          });
        });
      });
    });

    return it("filters on invalid merchant account ids", function(done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let subscriptionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        };

        return specHelper.defaultGateway.subscription.create(subscriptionParams, function(err, response) {
          let subscriptionId = response.subscription.id; 

          let multipleValueCriteria = {
            merchantAccountId: 'invalid_merchant_id',
            ids: subscriptionParams.id
          };

          let search = search =>
            (() => {
              let result = [];
              for (let criteria in multipleValueCriteria) {
                let value = multipleValueCriteria[criteria];
                result.push(search[criteria]().in(value));
              }
              return result;
            })()
          ;

          return specHelper.defaultGateway.subscription.search(search, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(0, response.length());
            return done();
          });
        });
      });
    });
  })
);
