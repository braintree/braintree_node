'use strict';

let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;
let braintree = specHelper.braintree;
let CreditCardNumbers = require('../../../lib/braintree/test/credit_card_numbers').CreditCardNumbers;

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
          assert.isDefined(verification.graphQLId);

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

    it('supports accountType debit', function (done) {
      let params = {
        creditCard: {
          cardholderName: 'John Smith',
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: '05/2014'
        },
        options: {
          merchantAccountId: 'hiper_brl',
          accountType: 'debit'
        }
      };

      specHelper.defaultGateway.creditCardVerification.create(params, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        let verification = response.verification;

        assert.equal(verification.processorResponseText, 'Approved');
        assert.equal(verification.creditCard.accountType, 'debit');

        done();
      });
    });

    it('supports accountType credit', function (done) {
      let params = {
        creditCard: {
          cardholderName: 'John Smith',
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: '05/2014'
        },
        options: {
          merchantAccountId: 'hiper_brl',
          accountType: 'credit'
        }
      };

      specHelper.defaultGateway.creditCardVerification.create(params, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        let verification = response.verification;

        assert.equal(verification.processorResponseText, 'Approved');
        assert.equal(verification.creditCard.accountType, 'credit');

        done();
      });
    });

    it('handles error AccountTypeIsInvalid', function (done) {
      let params = {
        creditCard: {
          cardholderName: 'John Smith',
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: '05/2014'
        },
        options: {
          merchantAccountId: 'hiper_brl',
          accountType: 'ach'
        }
      };

      specHelper.defaultGateway.creditCardVerification.create(params, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('verification').for('options').on('accountType')[0].code,
          ValidationErrorCodes.Verification.Options.AccountTypeIsInvalid
        );

        done();
      });
    });

    it('handles error AccountTypeNotSupported', function (done) {
      let params = {
        creditCard: {
          cardholderName: 'John Smith',
          number: '4000111111111115',
          expirationDate: '05/2014'
        },
        options: {
          accountType: 'debit'
        }
      };

      specHelper.defaultGateway.creditCardVerification.create(params, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('verification').for('options').on('accountType')[0].code,
          ValidationErrorCodes.Verification.Options.AccountTypeNotSupported
        );

        done();
      });
    });

    it('returns network response code/text', function (done) {
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

        assert.equal(verification.networkResponseCode, 'XX');
        assert.equal(verification.networkResponseText, 'sample network response text');

        done();
      });
    });

    context('network transaction id', function () {
      it('supports visa', function (done) {
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

          assert.isNotNull(verification.networkTransactionId);
          done();
        });
      });

      it('supports mastercard', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let params = {
            creditCard: {
              number: '5555555555554444',
              expirationDate: '05/12'
            }
          };

          specHelper.defaultGateway.creditCardVerification.create(params, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            let verification = response.verification;

            assert.isNotNull(verification.networkTransactionId);
            done();
          });
        });
      });
    });
  });
});
