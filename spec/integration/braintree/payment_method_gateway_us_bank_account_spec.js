'use strict';

let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;
let UsBankAccountVerification = require('../../../lib/braintree/us_bank_account_verification').UsBankAccountVerification;
let MerchantAccountTest = require('../../../lib/braintree/test/merchant_account').MerchantAccountTest;

describe('PaymentMethodGateway', function () {
  describe('exempt merchant', function () {
    describe('create', function () {
      it('vaults a US Bank Account from the nonce', done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function (err, response) {
          let customerId = response.customer.id;

          specHelper.generateValidUsBankAccountNonce('567891234', function (nonce) {
            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: nonce,
              options: {verificationMerchantAccountId: MerchantAccountTest.UsBankMerchantAccount}
            };

            specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
              let usBankAccount = response.paymentMethod;

              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isNotNull(response.paymentMethod.token);
              assert.equal(usBankAccount.last4, '1234');
              assert.equal(usBankAccount.accountHolderName, 'Dan Schulman');
              assert.equal(usBankAccount.routingNumber, '021000021');
              assert.equal(usBankAccount.accountType, 'checking');
              assert.match(usBankAccount.bankName, /CHASE/);
              assert.isTrue(usBankAccount.verified);
              assert.equal(usBankAccount.verifications.length, 1);
              assert.equal(usBankAccount.verifications[0].verificationMethod, UsBankAccountVerification.VerificationMethod.IndependentCheck);
              assert.equal(usBankAccount.verifications[0].status, UsBankAccountVerification.StatusType.Verified);

              done();
            });
          });
        })
      );

      it('does not vault a US Bank Account from an invalid nonce', done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function (err, response) {
          let customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: specHelper.generateInvalidUsBankAccountNonce(),
            options: {
              verificationMerchantAccountId: MerchantAccountTest.UsBankMerchantAccount
            }
          };

          specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
            assert.isFalse(response.success);
            assert.equal(response.errors.for('paymentMethod').on('paymentMethodNonce')[0].code,
              ValidationErrorCodes.PaymentMethod.PaymentMethodNonceUnknown);

            done();
          });
        })
      );
    });
  });

  describe('compliant merchant', function () {
    let gateway = specHelper.merchant2Gateway;

    describe('create', function () {
      it('vaults an unverified bank account', function (done) {
        gateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          specHelper.generateValidUsBankAccountNonce('567891234', gateway, function (nonce) {
            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: nonce,
              options: {
                verificationMerchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount
              }
            };

            gateway.paymentMethod.create(paymentMethodParams, function (err, response) {
              let usBankAccount = response.paymentMethod;

              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isNotNull(response.paymentMethod.token);
              assert.equal(usBankAccount.last4, '1234');
              assert.equal(usBankAccount.accountHolderName, 'Dan Schulman');
              assert.equal(usBankAccount.routingNumber, '021000021');
              assert.equal(usBankAccount.accountType, 'checking');
              assert.match(usBankAccount.bankName, /CHASE/);
              assert.isFalse(usBankAccount.verified);
              assert.equal(usBankAccount.verifications.length, 0);

              done();
            });
          });
        });
      });

      it('vaults an verified bank account', function (done) {
        let gateway = specHelper.merchant2Gateway;

        gateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          specHelper.generateValidUsBankAccountNonce('567891234', gateway, function (nonce) {
            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: nonce,
              options: {
                verificationMerchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
                usBankAccountVerificationMethod: UsBankAccountVerification.VerificationMethod.IndependentCheck
              }
            };

            gateway.paymentMethod.create(paymentMethodParams, function (err, response) {
              let usBankAccount = response.paymentMethod;

              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isNotNull(response.paymentMethod.token);
              assert.equal(usBankAccount.last4, '1234');
              assert.equal(usBankAccount.accountHolderName, 'Dan Schulman');
              assert.equal(usBankAccount.routingNumber, '021000021');
              assert.equal(usBankAccount.accountType, 'checking');
              assert.match(usBankAccount.bankName, /CHASE/);
              assert.isTrue(usBankAccount.verified);
              assert.equal(usBankAccount.verifications.length, 1);
              assert.equal(usBankAccount.verifications[0].verificationMethod, UsBankAccountVerification.VerificationMethod.IndependentCheck);
              assert.equal(usBankAccount.verifications[0].status, UsBankAccountVerification.StatusType.Verified);

              done();
            });
          });
        });
      });

      it('rejects an invalid verification method', function (done) {
        let gateway = specHelper.merchant2Gateway;

        gateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          specHelper.generateValidUsBankAccountNonce('567891234', gateway, function (nonce) {
            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: nonce,
              options: {
                verificationMerchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
                usBankAccountVerificationMethod: 'blahblah'
              }
            };

            gateway.paymentMethod.create(paymentMethodParams, function (err, response) {
              assert.isNull(err);
              assert.isFalse(response.success);

              assert.equal(
                response.errors.for('paymentMethod').for('options').on('usBankAccountVerificationMethod')[0].code,
                ValidationErrorCodes.PaymentMethod.UsBankAccountVerificationMethodIsInvalid
              );

              done();
            });
          });
        });
      });
    });
  });
});
