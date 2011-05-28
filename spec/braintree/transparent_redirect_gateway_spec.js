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
}).export(module);
