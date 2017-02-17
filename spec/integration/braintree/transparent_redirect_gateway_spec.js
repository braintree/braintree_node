import '../../spec_helper';

import { _ } from 'underscore';
let { braintree } = specHelper;

describe("TransparentRedirectGateway", function() {
  let { url } = specHelper.defaultGateway.transparentRedirect;

  describe("createCustomerData", function() {
    it("generates tr data for the customer", function(done) {
      let trData = specHelper.defaultGateway.transparentRedirect.createCustomerData({
        redirectUrl: 'http://www.example.com/',
        customer: {
          firstName: 'Dan'
        }
      });

      let customerParams = {
        customer: {
          last_name: 'Smith'
        }
      };

      return specHelper.simulateTrFormPost(url, trData, customerParams, (err, response) =>
        specHelper.defaultGateway.transparentRedirect.confirm(response, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.customer.firstName, 'Dan');
          assert.equal(response.customer.lastName, 'Smith');

          return done();
        })
      );
    });

    return it("can include the credit card and billing address", function(done) {
      let trData = specHelper.defaultGateway.transparentRedirect.createCustomerData({
        redirectUrl: 'http://www.example.com/',
        customer: {
          firstName: 'Dan',
          creditCard: {
            cardholderName: 'Cardholder',
            billingAddress: {
              streetAddress: '123 E Fake St'
            }
          }
        }
      });

      let customerParams = {
        customer: {
          last_name: 'Smith',
          creditCard: {
            number: '5105105105105100',
            expirationMonth: '05',
            expirationYear: '2017',
            billingAddress: {
              extendedAddress: '5th Floor'
            }
          }
        }
      };

      return specHelper.simulateTrFormPost(url, trData, customerParams, (err, response) =>
        specHelper.defaultGateway.transparentRedirect.confirm(response, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.customer.firstName, 'Dan');
          assert.equal(response.customer.creditCards[0].cardholderName, 'Cardholder');
          assert.equal(response.customer.creditCards[0].billingAddress.streetAddress, '123 E Fake St');
          assert.equal(response.customer.lastName, 'Smith');
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');
          assert.equal(response.customer.creditCards[0].expirationMonth, '05');
          assert.equal(response.customer.creditCards[0].expirationYear, '2017');
          assert.equal(response.customer.creditCards[0].billingAddress.extendedAddress, '5th Floor');

          return done();
        })
      );
    });
  });

  describe("updateCustomerData", () =>
    it("updates a customer", function(done) {
      let customerParams = {
        firstName: 'Old First Name',
        lastName: 'Old Last Name'
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let trData = specHelper.defaultGateway.transparentRedirect.updateCustomerData({
          redirectUrl: 'http://www.example.com/',
          customerId: response.customer.id,
          customer: {
            firstName: 'New First Name'
          }
        });

        let updateParams = {
          customer: {
            lastName: 'New Last Name'
          }
        };

        return specHelper.simulateTrFormPost(url, trData, updateParams, (err, response) =>
          specHelper.defaultGateway.transparentRedirect.confirm(response, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.customer.firstName, 'New First Name');
            assert.equal(response.customer.lastName, 'New Last Name');

            return done();
          })
        );
      });
    })
  );

  describe("transactionData", () =>
    it("creates a transaction", function(done) {
      let trData = specHelper.defaultGateway.transparentRedirect.transactionData({
        redirectUrl: 'http://www.example.com/',
        transaction: {
          amount: 50.00,
          type: 'sale'
        }
      });

      let transactionParams = {
        transaction: {
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2012'
          }
        }
      };

      return specHelper.simulateTrFormPost(url, trData, transactionParams, (err, response) =>
        specHelper.defaultGateway.transparentRedirect.confirm(response, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'authorized');
          assert.equal(response.transaction.amount, '50.00');
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');

          return done();
        })
      );
    })
  );

  describe("createCreditCard", () =>
    it("creates a credit card", done =>
      specHelper.defaultGateway.customer.create({firstName: 'Customer First Name'}, function(err, response) {
        let trData = specHelper.defaultGateway.transparentRedirect.createCreditCardData({
          redirectUrl: 'http://www.example.com/',
          creditCard: {
            customerId: response.customer.id,
            cardholderName: 'Dan'
          }
        });

        let creditCardParams = {
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2017'
          }
        };

        return specHelper.simulateTrFormPost(url, trData, creditCardParams, (err, response) =>
          specHelper.defaultGateway.transparentRedirect.confirm(response, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.creditCard.cardholderName, 'Dan');
            assert.equal(response.creditCard.maskedNumber, '510510******5100');

            return done();
          })
        );
      })
    )
  );

  describe("updateCreditCard", () =>
    it("updates a credit card", function(done) {
      let customerParams = {
        firstName: 'Customer First Name',
        creditCard: {
          cardholderName: 'Old Cardholder Name',
          number: '5105105105105100',
          expirationDate: '05/2017'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let trData = specHelper.defaultGateway.transparentRedirect.updateCreditCardData({
          redirectUrl: 'http://www.example.com/',
          paymentMethodToken: response.customer.creditCards[0].token,
          creditCard: {
            cardholderName: 'New Cardholder Name'
          }
        });

        let creditCardParams = {
          creditCard: {
            number: '4111111111111111'
          }
        };

        return specHelper.simulateTrFormPost(url, trData, creditCardParams, (err, response) =>
          specHelper.defaultGateway.transparentRedirect.confirm(response, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.creditCard.cardholderName, 'New Cardholder Name');
            assert.equal(response.creditCard.maskedNumber, '411111******1111');

            return done();
          })
        );
      });
    })
  );

  return describe("confirm", function() {
    it("handles invalid hashes", done =>
      specHelper.defaultGateway.transparentRedirect.confirm('a=b&hash=invalid', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.invalidTransparentRedirectHashError);
        return done();
      })
    );

    it("handles status 401", done =>
      specHelper.defaultGateway.transparentRedirect.confirm('http_status=401&hash=none', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.authenticationError);
        return done();
      })
    );


    it("handles status 403", done =>
      specHelper.defaultGateway.transparentRedirect.confirm('http_status=403&hash=irrelevant', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.authorizationError);
        return done();
      })
    );

    it("handles status 426", done =>
      specHelper.defaultGateway.transparentRedirect.confirm('http_status=426&hash=irrelevant', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.upgradeRequired);
        return done();
      })
    );

    it("handles status 500", done =>
      specHelper.defaultGateway.transparentRedirect.confirm('http_status=500&hash=irrelevant', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.serverError);
        return done();
      })
    );

    return it("handles status 503", done =>
      specHelper.defaultGateway.transparentRedirect.confirm('http_status=503&hash=irrelevant', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.downForMaintenanceError);
        return done();
      })
    );
  });
});

