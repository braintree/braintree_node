'use strict';

describe('AdvancedSearch', function () {
  describe('textFields', function () {
    let subscription1, subscription2;

    before(function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let creditCard = response.customer.creditCards[0];

        specHelper.defaultGateway.subscription.create({
          paymentMethodToken: creditCard.token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        }, function (err, response) {
          subscription1 = response.subscription;
          specHelper.defaultGateway.subscription.create({
            paymentMethodToken: creditCard.token,
            planId: specHelper.plans.trialless.id,
            id: specHelper.randomId()
          }, function (err, response) {
            subscription2 = response.subscription;
            done();
          });
        });
      });
    });

    it("accepts the 'is' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.id().is(subscription1.id), function (err, response) {
        assert.isTrue(response.success);
        assert.equal(response.length(), 1);

        return response.first(function (err, result) {
          assert.isObject(result);
          assert.equal(result.id, subscription1.id);
          assert.isNull(err);

          done();
        });
      })
    );

    it("accepts the 'isNot' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.id().isNot(subscription1.id), function (err, response) {
        assert.isTrue(response.success);
        specHelper.doesNotInclude(response.ids, subscription1.id);
        assert.include(response.ids, subscription2.id);

        done();
      })
    );

    it("accepts the 'startsWith' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.id().startsWith(subscription1.id.slice(0, subscription1.id.length - 1)), function (err, response) {
        assert.isTrue(response.success);
        assert.equal(response.length(), 1);

        return response.first(function (err, result) {
          assert.isObject(result);
          assert.equal(result.id, subscription1.id);
          assert.isNull(err);

          done();
        });
      })
    );

    it("accepts the 'endsWith' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.id().endsWith(subscription1.id.slice(1)), function (err, response) {
        assert.isTrue(response.success);
        assert.equal(response.length(), 1);

        return response.first(function (err, result) {
          assert.isObject(result);
          assert.equal(result.id, subscription1.id);
          assert.isNull(err);

          done();
        });
      })
    );

    it("accepts the 'contains' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.id().contains(subscription1.id.slice(1, subscription1.id.length - 1)), function (err, response) {
        assert.isTrue(response.success);
        assert.equal(response.length(), 1);

        return response.first(function (err, result) {
          assert.isObject(result);
          assert.equal(result.id, subscription1.id);
          assert.isNull(err);

          done();
        });
      })
    );
  });

  describe('keyValueFields', () =>
    it("accepts the 'is' operator", function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/14'
        },
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        let transaction1 = response.transaction;

        specHelper.defaultGateway.testing.settle(transaction1.id, function () {
          transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/15'
            },
            options: {
              submitForSettlement: true
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            let transaction2 = response.transaction;

            specHelper.defaultGateway.testing.settle(transaction2.id, () =>
              specHelper.defaultGateway.transaction.refund(transaction1.id, () =>
                specHelper.defaultGateway.transaction.search(function (search) {
                  search.id().is(transaction1.id);

                  return search.refund().is(true);
                }
                  , function (err, response) {
                  assert.isTrue(response.success);
                  assert.equal(response.length(), 1);

                  return response.first(function (err, result) {
                    assert.isObject(result);
                    assert.equal(result.id, transaction1.id);
                    assert.isNull(err);

                    done();
                  });
                })
              )
            );
          });
        });
      });
    })
  );

  describe('multipleValueFields', function () {
    let subscription1, subscription2;

    before(function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let creditCard = response.customer.creditCards[0];

        specHelper.defaultGateway.subscription.create({
          paymentMethodToken: creditCard.token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        }, function (err, response) {
          subscription1 = response.subscription;
          specHelper.defaultGateway.subscription.create({
            paymentMethodToken: creditCard.token,
            planId: specHelper.plans.trialless.id,
            id: specHelper.randomId()
          }, function (err, response) {
            subscription2 = response.subscription;
            done();
          });
        });
      });
    });

    it("accepts the 'in' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.ids().in(subscription1.id, subscription2.id), function (err, response) {
        assert.isTrue(response.success);

        let subscriptionIds = [];

        return response.each(function (err, subscription) {
          subscriptionIds.push(subscription.id);
          if (subscriptionIds.length === 2) {
            assert.include(subscriptionIds, subscription1.id);
            assert.include(subscriptionIds, subscription2.id);
            assert.isNull(err);

            done();
          }
        });
      })
    );

    it("accepts the 'is' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.ids().is(subscription1.id), function (err, response) {
        assert.isTrue(response.success);
        assert.equal(response.ids.length, 1);
        assert.include(response.ids, subscription1.id);
        specHelper.doesNotInclude(response.ids, subscription2.id);

        done();
      })
    );
  });

  describe('multipleValueOrTextFields', function () {
    let subscription1, subscription2;

    before(function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let creditCard = response.customer.creditCards[0];

        specHelper.defaultGateway.subscription.create({
          paymentMethodToken: creditCard.token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        }, function (err, response) {
          subscription1 = response.subscription;
          specHelper.defaultGateway.subscription.create({
            paymentMethodToken: creditCard.token,
            planId: specHelper.plans.addonDiscountPlan.id,
            id: specHelper.randomId()
          }, function (err, response) {
            subscription2 = response.subscription;
            done();
          });
        });
      });
    });

    it("accepts the 'in' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.planId().in(subscription1.planId, subscription2.planId), function (err, response) {
        assert.isTrue(response.success);
        assert.include(response.ids, subscription1.id);
        assert.include(response.ids, subscription2.id);

        done();
      })
    );

    it("accepts the 'is' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.planId().is(subscription1.planId), function (err, response) {
        assert.isTrue(response.success);
        assert.include(response.ids, subscription1.id);
        specHelper.doesNotInclude(response.ids, subscription2.id);

        done();
      })
    );

    it("accepts the 'isNot' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.planId().isNot(subscription1.planId), function (err, response) {
        assert.isTrue(response.success);
        specHelper.doesNotInclude(response.ids, subscription1.id);
        assert.include(response.ids, subscription2.id);

        done();
      })
    );

    it("accepts the 'startsWith' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.planId().startsWith(subscription1.planId.slice(0, subscription1.planId.length - 1)), function (err, response) {
        assert.isTrue(response.success);
        assert.include(response.ids, subscription1.id);
        specHelper.doesNotInclude(response.ids, subscription2.id);

        done();
      })
    );

    it("accepts the 'endsWith' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.planId().endsWith(subscription1.planId.slice(1)), function (err, response) {
        assert.isTrue(response.success);
        assert.include(response.ids, subscription1.id);
        specHelper.doesNotInclude(response.ids, subscription2.id);

        done();
      })
    );

    it("accepts the 'contains' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.planId().contains(subscription1.planId.slice(1, subscription1.planId.length - 1)), function (err, response) {
        assert.isTrue(response.success);
        assert.include(response.ids, subscription1.id);
        specHelper.doesNotInclude(response.ids, subscription2.id);

        done();
      })
    );
  });

  describe('rangeFields', function () {
    let subscription1, subscription2;

    before(function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let creditCard = response.customer.creditCards[0];

        specHelper.defaultGateway.subscription.create({
          paymentMethodToken: creditCard.token,
          planId: specHelper.plans.trialless.id,
          id: specHelper.randomId()
        }, function (err, response) {
          subscription1 = response.subscription;
          specHelper.defaultGateway.subscription.create({
            paymentMethodToken: creditCard.token,
            planId: specHelper.plans.addonDiscountPlan.id,
            id: specHelper.randomId()
          }, function (err, response) {
            subscription2 = response.subscription;
            done();
          });
        });
      });
    });

    it("accepts the 'min' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.price().min(Number(subscription1.price)), function (err, response) {
        assert.isTrue(response.success);
        assert.include(response.ids, subscription1.id);
        specHelper.doesNotInclude(response.ids, subscription2.id);

        done();
      })
    );

    it("accepts the 'max' operator", done =>
      specHelper.defaultGateway.subscription.search(search => search.price().max(Number(subscription2.price)), function (err, response) {
        assert.isTrue(response.success);
        assert.include(response.ids, subscription2.id);
        specHelper.doesNotInclude(response.ids, subscription1.id);

        done();
      })
    );

    it("accepts the 'between' operator", function (done) {
      let subscriptionPrice = Number(subscription1.price);

      specHelper.defaultGateway.subscription.search(search => search.price().between(subscriptionPrice - 0.01, subscriptionPrice + 0.01), function (err, response) {
        assert.isTrue(response.success);
        assert.include(response.ids, subscription1.id);
        specHelper.doesNotInclude(response.ids, subscription2.id);

        done();
      });
    });
  });
});
