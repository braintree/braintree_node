require('../../spec_helper');
let { CreditCardVerification } = require('../../../lib/braintree/credit_card_verification');
let { CreditCardNumbers } = require('../../../lib/braintree/test/credit_card_numbers');
let { ValidationErrorCodes } = require('../../../lib/braintree/validation_error_codes');
let { braintree } = specHelper;

describe("CreditCardVerificationGateway", function() {
  describe("find", function() {
    it("finds a verification", function(done) {
      let customerParams = {
        creditCard: {
          cardholderName: "John Smith",
          number: '4000111111111115',
          expirationDate: '05/2014',
          options: {
            verifyCard: true
          }
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, (err, response) =>
        specHelper.defaultGateway.creditCardVerification.find(response.verification.id, function(err, verification) {
          assert.isNull(err);
          assert.equal(verification.creditCard.cardholderName, 'John Smith');

          return done();
        })
      );
    });

    it("handles not finding a verification", done =>
      specHelper.defaultGateway.creditCardVerification.find('nonexistent_verification', function(err, verification) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
    );

    return it("handles whitespace ids", done =>
      specHelper.defaultGateway.creditCardVerification.find(' ', function(err, verification) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
    );
  });

  return describe("create", function() {
    it("handles verified verifications", function(done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: '4111111111111111',
          expirationDate: '05/2014'
        }
      };

      return specHelper.defaultGateway.creditCardVerification.create(params, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        return done();
      });
    });

    it("handles processor declined verifications", function(done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: '4000111111111115',
          expirationDate: '05/2014'
        }
      };

      return specHelper.defaultGateway.creditCardVerification.create(params, function(err, response) {
        assert.isFalse(response.success);

        return done();
      });
    });

    return it("handles validation errors", function(done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: '4111111111111111',
          expirationDate: '05/2014'
        },
        options: {
          amount: "-10.00"
        }
      };

      return specHelper.defaultGateway.creditCardVerification.create(params, function(err, response) {
        assert.equal(
          response.errors.for("verification").for("options").on("amount")[0].code,
          ValidationErrorCodes.Verification.Options.AmountCannotBeNegative
        );

        return done();
      });
    });
  });
});
