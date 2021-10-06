'use strict';

let Transaction = require('../../../lib/braintree/transaction').Transaction;
let UsBankAccountVerification = require('../../../lib/braintree/us_bank_account_verification').UsBankAccountVerification;
let MerchantAccountTest = require('../../../lib/braintree/test_values/merchant_account').MerchantAccountTest;

describe('UsBankAccountGateway', function () {
  describe('find', function () {
    it('finds the US bank account', done =>
      specHelper.defaultGateway.customer.create({}, (err, response) =>
        specHelper.generateValidUsBankAccountNonce('567891234', function (nonce) {
          let usBankAccountParams = {
            customerId: response.customer.id,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.UsBankMerchantAccount
            }
          };

          specHelper.defaultGateway.paymentMethod.create(usBankAccountParams, function (err, response) {
            let usBankAccountToken = response.paymentMethod.token;

            specHelper.defaultGateway.usBankAccount.find(usBankAccountToken, function (err, usBankAccount) {
              assert.isNull(err);
              assert.equal(usBankAccount.last4, '1234');
              assert.equal(usBankAccount.accountHolderName, 'Dan Schulman');
              assert.equal(usBankAccount.routingNumber, '021000021');
              assert.equal(usBankAccount.accountType, 'checking');
              assert.match(usBankAccount.bankName, /CHASE/);
              assert.equal(usBankAccount.achMandate.text, 'cl mandate text');
              assert.isTrue(usBankAccount.achMandate.acceptedAt instanceof Date);
              assert.isTrue(usBankAccount.default);
              assert.isTrue(usBankAccount.verified);

              assert.equal(usBankAccount.verifications.length, 1);

              let verification = usBankAccount.verifications[0];

              assert.equal(verification.verificationMethod, UsBankAccountVerification.VerificationMethod.IndependentCheck);
              assert.equal(verification.verificationStatus, UsBankAccountVerification.StatusType.IndependentCheck);

              done();
            });
          });
        })
      )
    );

    it('does not find invalid US bank account', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        assert.isTrue(response.success);
        specHelper.defaultGateway.usBankAccount.find(specHelper.generateInvalidUsBankAccountNonce(), function (err, usBankAccount) {
          assert.isUndefined(usBankAccount);
          assert.equal(err.type, 'notFoundError');

          done();
        });
      })
    );
  });

  describe('sale', () =>
    it('transacts on a US bank account', done =>
      specHelper.defaultGateway.customer.create({}, (err, response) =>
        specHelper.generateValidUsBankAccountNonce('567891234', function (nonce) {
          let usBankAccountParams = {
            customerId: response.customer.id,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.UsBankMerchantAccount
            }
          };

          specHelper.defaultGateway.paymentMethod.create(usBankAccountParams, function (err, response) {
            let transactionParams = {
              merchantAccountId: MerchantAccountTest.UsBankMerchantAccount,
              amount: '10.00'
            };
            let usBankAccountToken = response.paymentMethod.token;

            specHelper.defaultGateway.usBankAccount.sale(usBankAccountToken, transactionParams, function (err, response) {
              assert.isTrue(response.success);
              assert.equal(response.transaction.status, Transaction.Status.SettlementPending);
              assert.equal(response.transaction.usBankAccount.last4, '1234');
              assert.equal(response.transaction.usBankAccount.accountHolderName, 'Dan Schulman');
              assert.equal(response.transaction.usBankAccount.routingNumber, '021000021');
              assert.equal(response.transaction.usBankAccount.accountType, 'checking');
              assert.match(response.transaction.usBankAccount.bankName, /CHASE/);
              assert.equal(response.transaction.usBankAccount.achMandate.text, 'cl mandate text');
              assert.isTrue(response.transaction.usBankAccount.achMandate.acceptedAt instanceof Date);

              done();
            });
          });
        })
      )
    )
  );
});
