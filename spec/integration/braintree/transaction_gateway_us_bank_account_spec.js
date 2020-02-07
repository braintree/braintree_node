'use strict';

let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;
let Transaction = require('../../../lib/braintree/transaction').Transaction;
let MerchantAccountTest = require('../../../lib/braintree/test/merchant_account').MerchantAccountTest;

describe('TransactionGateway', function () {
  describe('exempt merchant', function () {
    context('us bank account nonce', function () {
      it('succeeds and vaults a us bank account nonce', function (done) {
        specHelper.generateValidUsBankAccountNonce('567891234', function (nonce) {
          let transactionParams = {
            merchantAccountId: MerchantAccountTest.UsBankMerchantAccount,
            amount: '10.00',
            paymentMethodNonce: nonce,
            options: {
              submitForSettlement: true,
              storeInVault: true
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
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
      });

      it('succeeds and vaults a us bank account nonce and can transact on vaulted token', done =>
        specHelper.generateValidUsBankAccountNonce('567891234', function (nonce) {
          let transactionParams = {
            merchantAccountId: MerchantAccountTest.UsBankMerchantAccount,
            amount: '10.00',
            paymentMethodNonce: nonce,
            options: {
              submitForSettlement: true,
              storeInVault: true
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isTrue(response.success);
            assert.equal(response.transaction.status, Transaction.Status.SettlementPending);
            assert.equal(response.transaction.usBankAccount.last4, '1234');
            assert.equal(response.transaction.usBankAccount.accountHolderName, 'Dan Schulman');
            assert.equal(response.transaction.usBankAccount.routingNumber, '021000021');
            assert.equal(response.transaction.usBankAccount.accountType, 'checking');
            assert.match(response.transaction.usBankAccount.bankName, /CHASE/);
            assert.equal(response.transaction.usBankAccount.achMandate.text, 'cl mandate text');
            assert.isTrue(response.transaction.usBankAccount.achMandate.acceptedAt instanceof Date);
            let token = response.transaction.usBankAccount.token;

            transactionParams = {
              merchantAccountId: MerchantAccountTest.UsBankMerchantAccount,
              amount: '10.00',
              paymentMethodToken: token,
              options: {
                submitForSettlement: true
              }
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
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
      );

      it('fails when us bank account nonce is not found', function (done) {
        let transactionParams = {
          merchantAccountId: MerchantAccountTest.UsBankMerchantAccount,
          amount: '10.00',
          paymentMethodNonce: specHelper.generateInvalidUsBankAccountNonce(),
          options: {
            submitForSettlement: true,
            storeInVault: true
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('paymentMethodNonce')[0].code,
            ValidationErrorCodes.Transaction.PaymentMethodNonceUnknown
          );

          done();
        });
      });
    });
  });

  describe('compliant merchant', function () {
    let gateway = specHelper.merchant2Gateway;

    context('plaid verified', function () {
      it('transacts successfully', function (done) {
        specHelper.generatePlaidUsBankAccountNonce(gateway, function (nonce) {
          let transactionParams = {
            merchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
            amount: '10.00',
            paymentMethodNonce: nonce,
            options: {
              submitForSettlement: true,
              storeInVault: true
            }
          };

          gateway.transaction.sale(transactionParams, function (err, response) {
            assert.isTrue(response.success);

            let usBankAccount = response.transaction.usBankAccount;

            assert.equal(usBankAccount.last4, '0000');
            assert.equal(usBankAccount.accountHolderName, 'Dan Schulman');
            assert.equal(usBankAccount.routingNumber, '011000015');
            assert.equal(usBankAccount.accountType, 'checking');
            assert.match(usBankAccount.bankName, /FEDERAL/);
            assert.equal(usBankAccount.achMandate.text, 'cl mandate text');

            done();
          });
        });
      });
    });

    context('not plaid verified', () => {
      it('rejects transaction on unverified nonce', function (done) {
        specHelper.generateValidUsBankAccountNonce('567891234', gateway, function (nonce) {
          let transactionParams = {
            merchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
            amount: '10.00',
            paymentMethodNonce: nonce,
            options: {
              submitForSettlement: true,
              storeInVault: true
            }
          };

          gateway.transaction.sale(transactionParams, function (err, response) {
            assert.isFalse(response.success);
            assert.equal(
              response.errors.for('transaction').on('paymentMethodNonce')[0].code,
              ValidationErrorCodes.Transaction.UsBankAccountNonceMustBePlaidVerified
            );

            done();
          });
        });
      });

      it('rejects transaction on unverified token', done => {
        specHelper.generateValidUsBankAccountNonce('567891234', gateway, function (nonce) {
          gateway.customer.create({}, (err, response) => {
            let customerId = response.customer.id;

            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: nonce,
              options: {
                verificationMerchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount
              }
            };

            gateway.paymentMethod.create(paymentMethodParams, (err, response) => {
              assert.isNull(err);

              let usBankAccount = response.paymentMethod;
              let transactionParams = {
                merchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
                amount: '10.00',
                paymentMethodToken: usBankAccount.token,
                options: {
                  submitForSettlement: true
                }
              };

              gateway.transaction.sale(transactionParams, (err, response) => {
                assert.isNull(err);
                assert.isFalse(response.success);

                assert.equal(
                  response.errors.for('transaction').on('paymentMethodToken')[0].code,
                  ValidationErrorCodes.Transaction.UsBankAccountNotVerified
                );

                done();
              });
            });
          });
        });
      });
    });
  });
});
