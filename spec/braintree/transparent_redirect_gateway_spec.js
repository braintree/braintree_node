require('../spec_helper');

var _ = require('underscore')._;

vows.describe('TransparentRedirectGateway').addBatch({
  'createCustomerData': {
    'generating data to create a customer': {
      topic: function () {
        var callback = this.callback;
        specHelper.simulateTrFormPost(
          specHelper.defaultGateway.transparentRedirect.url,
          specHelper.defaultGateway.transparentRedirect.createCustomerData({
            redirectUrl: 'http://www.example.com',
            customer: {
              firstName: 'Dan'
            }
          }),
          {customer: {last_name: 'Smith'}},
          function (err, result) {
            specHelper.defaultGateway.transparentRedirect.confirm(result, callback);
          }
        );
      },
      'is successful': function (err, result) {
        assert.isNull(err);
        assert.equal(result.success, true);
      },
      'uses data submitted in tr_data': function (err, result) {
        assert.equal(result.customer.firstName, 'Dan');
      },
      'uses data submitted in form params': function (err, result) {
        assert.equal(result.customer.lastName, 'Smith');
      }
    },

    'creating a customer with credit card and billing address': {
      topic: function () {
        var callback = this.callback;
        specHelper.simulateTrFormPost(
          specHelper.defaultGateway.transparentRedirect.url,
          specHelper.defaultGateway.transparentRedirect.createCustomerData({
            redirectUrl: 'http://www.example.com',
            customer: {
              firstName: 'Dan',
              creditCard: {
                cardholderName: 'Cardholder',
                billingAddress: {
                  streetAddress: '123 E Fake St'
                }
              }
            }
          }),
          {customer: {
            last_name: 'Smith',
            creditCard: {
              number: '5105105105105100',
              expirationMonth: '05',
              expirationYear: '2017',
              billingAddress: {
                extendedAddress: '5th Floor'
              }
            }
          }},
          function (err, result) {
            specHelper.defaultGateway.transparentRedirect.confirm(result, callback);
          }
        );
      },
      'is successful': function (err, result) {
        assert.isNull(err);
        assert.equal(result.success, true);
      },
      'uses data submitted in tr_data': function (err, result) {
        assert.equal(result.customer.firstName, 'Dan');
        assert.equal(result.customer.creditCards[0].cardholderName, 'Cardholder');
        assert.equal(result.customer.creditCards[0].billingAddress.streetAddress, '123 E Fake St');
      },
      'uses data submitted in form params': function (err, result) {
        assert.equal(result.customer.lastName, 'Smith');
        assert.equal(result.customer.creditCards[0].maskedNumber, '510510******5100');
        assert.equal(result.customer.creditCards[0].expirationMonth, '05');
        assert.equal(result.customer.creditCards[0].expirationYear, '2017');
        assert.equal(result.customer.creditCards[0].billingAddress.extendedAddress, '5th Floor');
      }
    }
  },

  'updateCustomerData': {
    'updating a customer': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            firstName: 'Old First Name',
            lastName: 'Old Last Name'
          },
          function (err, result) {
            specHelper.simulateTrFormPost(
              specHelper.defaultGateway.transparentRedirect.url,
              specHelper.defaultGateway.transparentRedirect.updateCustomerData({
                redirectUrl: 'http://www.example.com',
                customerId: result.customer.id,
                customer: {
                  firstName: 'New First Name'
                }
              }),
              {customer: {lastName: 'New Last Name'}},
              function (err, result) {
                specHelper.defaultGateway.transparentRedirect.confirm(result, callback);
              }
            );
          }
        );
      },
      'is successful': function (err, result) {
        assert.isNull(err);
        assert.equal(result.success, true);
      },
      'uses data submitted in tr_data': function (err, result) {
        assert.equal(result.customer.firstName, 'New First Name');
      },
      'uses data submitted in form params': function (err, result) {
        assert.equal(result.customer.lastName, 'New Last Name');
      }
    }
  },

  'transactionData': {
    'generating data to create a transaction': {
      topic: function () {
        var callback = this.callback;
        specHelper.simulateTrFormPost(
          specHelper.defaultGateway.transparentRedirect.url,
          specHelper.defaultGateway.transparentRedirect.transactionData({
            redirectUrl: 'http://www.example.com',
            transaction: {
              amount: 50.00,
              type: 'sale'
            }
          }),
          {
            transaction: {
              creditCard: {
                number: '5105105105105100',
                expirationDate: '05/2012'
              }
            }
          },
          function (err, result) {
            specHelper.defaultGateway.transparentRedirect.confirm(result, callback);
          }
        );
      },
      'is successful': function (err, result) {
        assert.isNull(err);
        assert.equal(result.success, true);
      },
      'creates a transaction': function (err, result) {
        assert.equal(result.transaction.status, 'authorized');
      },
      'uses data submitted in tr_data': function (err, result) {
        assert.equal(result.transaction.amount, '50.00');
      },
      'uses data submitted in form params': function (err, result) {
        assert.equal(result.transaction.creditCard.maskedNumber, '510510******5100');
      }
    },
  },

  'createCreditCard': {
    'generating data to create a credit card': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          { firstName: 'Customer First Name' },
          function (err, result) {
            specHelper.simulateTrFormPost(
              specHelper.defaultGateway.transparentRedirect.url,
              specHelper.defaultGateway.transparentRedirect.createCreditCardData({
                redirectUrl: 'http://www.example.com',
                creditCard: {
                  customerId: result.customer.id,
                  cardholderName: 'Dan'
                }
              }),
              {
                creditCard: {
                  number: '5105105105105100',
                  expirationDate: '05/2017'
                }
              },
              function (err, result) {
                specHelper.defaultGateway.transparentRedirect.confirm(result, callback);
              }
            );
          }
        );
      },
      'is successful': function (err, result) {
        assert.isNull(err);
        assert.equal(result.success, true);
      },
      'uses data submitted in tr_data': function (err, result) {
        assert.equal(result.creditCard.cardholderName, 'Dan');
      },
      'uses data submitted in form params': function (err, result) {
        assert.equal(result.creditCard.maskedNumber, '510510******5100');
      }
    },
  },

  'updateCreditCard': {
    'generating data to update a credit card': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            firstName: 'Customer First Name',
            creditCard: {
              cardholderName: 'Old Cardholder Name',
              number: '5105105105105100',
              expirationDate: '05/2017'
            }
          },
          function (err, result) {
            specHelper.simulateTrFormPost(
              specHelper.defaultGateway.transparentRedirect.url,
              specHelper.defaultGateway.transparentRedirect.updateCreditCardData({
                redirectUrl: 'http://www.example.com',
                paymentMethodToken: result.customer.creditCards[0].token,
                creditCard: {
                  cardholderName: 'New Cardholder Name'
                }
              }),
              {
                creditCard: {
                  number: '4111111111111111',
                }
              },
              function (err, result) {
                specHelper.defaultGateway.transparentRedirect.confirm(result, callback);
              }
            );
          }
        );
      },
      'is successful': function (err, result) {
        assert.isNull(err);
        assert.equal(result.success, true);
      },
      'uses data submitted in tr_data': function (err, result) {
        assert.equal(result.creditCard.cardholderName, 'New Cardholder Name');
      },
      'uses data submitted in form params': function (err, result) {
        assert.equal(result.creditCard.maskedNumber, '411111******1111');
      }
    },
  }
}).export(module);
