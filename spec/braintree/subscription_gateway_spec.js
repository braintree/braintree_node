require('../spec_helper');

var _ = require('underscore')._;

vows.describe('SubscriptionGateway').addBatch({
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
}).export(module);
