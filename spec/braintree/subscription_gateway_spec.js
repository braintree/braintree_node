require('../spec_helper');

var _ = require('underscore')._;

vows.describe('SubscriptionGateway').addBatch({
  'cancel': {
    'when the subscription can be canceled': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            }
          },
          function (err, result) {
            specHelper.defaultGateway.subscription.create(
              {
                paymentMethodToken: result.customer.creditCards[0].token,
                planId: specHelper.plans.trialless.id
              },
              function (err, result) {
                specHelper.defaultGateway.subscription.cancel(result.subscription.id, callback);
              }
            );
          }
        );
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'cancels the subscription': function (err, result) {
        assert.equal(result.subscription.status, 'Canceled');
      }
    },
    'when the subscription cannot be canceled': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            }
          },
          function (err, result) {
            specHelper.defaultGateway.subscription.create(
              {
                paymentMethodToken: result.customer.creditCards[0].token,
                planId: specHelper.plans.trialless.id
              },
              function (err, result) {
                specHelper.defaultGateway.subscription.cancel(result.subscription.id, function (err, result) {
                  specHelper.defaultGateway.subscription.cancel(result.subscription.id, callback);
                });
              }
            );
          }
        );
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a unified message': function (err, response) {
        assert.equal(response.message, 'Subscription has already been canceled.');
      },
      'has an error on base': function (err, response) {
        assert.equal(response.errors.for('subscription').on('status').code, '81905');
      },
    },
    'when the subscription cannot be found': {
      topic: function () {
        specHelper.defaultGateway.subscription.cancel('nonexistent_subscription', this.callback);
      },
      'has a not found error': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      },
    }
  },

  'create': {
    'using a payment method token': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            }
          },
          callback
        );
      },
      'for a minimal case': {
        topic: function (result) {
          var callback = this.callback;
          var token = result.customer.creditCards[0].token;
          specHelper.defaultGateway.subscription.create({
            paymentMethodToken: token,
            planId: specHelper.plans.trialless.id
          }, callback);
        },
        'does not have an error': function (err, response) { assert.isNull(err); },
        'is succesful': function (err, response) { assert.equal(response.success, true); },
        'has the expected plan id and amount': function (err, response) {
          assert.equal(response.subscription.planId, specHelper.plans.trialless.id);
          assert.equal(response.subscription.price, specHelper.plans.trialless.price);
        }
      }
    },

    'with validation errors': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.subscription.create(
          {
            paymentMethodToken: 'invalid_token',
            planId: 'invalid_plan_id'
          },
          callback
        );
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a unified message': function (err, response) {
        assert.equal(response.message, 'Payment method token is invalid.\nPlan ID is invalid.');
      },
      'has an error on plan id': function (err, response) {
        assert.equal(response.errors.for('subscription').on('planId').code, '91904');
      },
      'has an error on payment method token': function (err, response) {
        assert.equal(response.errors.for('subscription').on('paymentMethodToken').code, '91903');
      },
    }
  },

  'find': {
    'when subscription can be found': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            }
          },
          function (err, result) {
            specHelper.defaultGateway.subscription.create(
              {
                paymentMethodToken: result.customer.creditCards[0].token,
                planId: specHelper.plans.trialless.id
              },
              function (err, result) {
                specHelper.defaultGateway.subscription.find(result.subscription.id, callback);
              }
            );
          }
        );
      },
      'does not have an error': function (err, subscription) { assert.isNull(err); },
      'returns the subscription': function (err, subscription) {
        assert.equal(subscription.planId, specHelper.plans.trialless.id);
        assert.equal(subscription.price, specHelper.plans.trialless.price);
        assert.equal(subscription.status, 'Active');
      }
    },
    'when the subscription cannot be found': {
      topic: function () {
        specHelper.defaultGateway.subscription.find('nonexistent_subscription', this.callback);
      },
      'has a not found error': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      },
    }
  }
}).export(module);
