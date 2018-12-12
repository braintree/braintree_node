'use strict';

let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;
let braintree = specHelper.braintree;

describe('CreditCardVerificationGateway', function () {
  describe('find', function () {
    it('finds a verification', function (done) {
      let customerParams = {
        creditCard: {
          cardholderName: 'John Smith',
          number: '4000111111111115',
          expirationDate: '05/2014',
          options: {
            verifyCard: true
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, (err, response) =>
        specHelper.defaultGateway.creditCardVerification.find(response.verification.id, function (err, verification) {
          assert.isNull(err);
          assert.equal(verification.creditCard.cardholderName, 'John Smith');

          done();
        })
      );
    });

    it('handles not finding a verification', done =>
      specHelper.defaultGateway.creditCardVerification.find('nonexistent_verification', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('handles whitespace ids', done =>
      specHelper.defaultGateway.creditCardVerification.find(' ', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });

  describe('create', function () {
    it('handles verified verifications', function (done) {
      let params = {
        creditCard: {
          cardholderName: 'John Smith',
          number: '4111111111111111',
          expirationDate: '05/2014'
        }
      };

      specHelper.defaultGateway.creditCardVerification.create(params, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        let verification = response.verification;

        assert.equal(verification.processorResponseCode, '1000');
        assert.equal(verification.processorResponseText, 'Approved');
        assert.equal(verification.processorResponseType, 'approved');

        done();
      });
    });

    it('handles processor declined verifications', function (done) {
      let params = {
        creditCard: {
          cardholderName: 'John Smith',
          number: '4000111111111115',
          expirationDate: '05/2014'
        }
      };

      specHelper.defaultGateway.creditCardVerification.create(params, function (err, response) {
        assert.isFalse(response.success);

        let verification = response.verification;

        assert.equal(verification.processorResponseCode, '2000');
        assert.equal(verification.processorResponseText, 'Do Not Honor');
        assert.equal(verification.processorResponseType, 'soft_declined');

        done();
      });
    });

    it('handles validation errors', function (done) {
      let params = {
        creditCard: {
          cardholderName: 'John Smith',
          number: '4111111111111111',
          expirationDate: '05/2014'
        },
        options: {
          amount: '-10.00'
        }
      };

      specHelper.defaultGateway.creditCardVerification.create(params, function (err, response) {
        assert.equal(
          response.errors.for('verification').for('options').on('amount')[0].code,
          ValidationErrorCodes.Verification.Options.AmountCannotBeNegative
        );

        done();
      });
    });
  });
});
