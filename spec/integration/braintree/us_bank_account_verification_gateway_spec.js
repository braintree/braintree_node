'use strict';
let _ = require('underscore');

let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;
let braintree = specHelper.braintree;
let UsBankAccountVerification = require('../../../lib/braintree/us_bank_account_verification').UsBankAccountVerification;
let MerchantAccountTest = require('../../../lib/braintree/test/merchant_account').MerchantAccountTest;

describe('UsBankAccountVerificationGateway', function () {
  describe('confirmMicroTransferAmounts', function () {
    let gateway = specHelper.merchant2Gateway;

    it('successfully confirms settled micro deposit amounts', function (done) {
      let customerParams = {};

      gateway.customer.create(customerParams, (err, response) => {
        let customerId = response.customer.id;

        specHelper.generateValidUsBankAccountNonce('1000000000', gateway, function (nonce) {
          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
              usBankAccountVerificationMethod: UsBankAccountVerification.VerificationMethod.MicroTransfers
            }
          };

          gateway.paymentMethod.create(paymentMethodParams, (err, response) => {
            assert.isNull(err);

            let usBankAccount = response.usBankAccount;

            assert.isFalse(usBankAccount.verified);

            let verification = usBankAccount.verifications[0];

            assert.equal(verification.verificationMethod, UsBankAccountVerification.VerificationMethod.MicroTransfers);
            assert.isNull(verification.verificationDeterminedAt);

            gateway.usBankAccountVerification.confirmMicroTransferAmounts(verification.id, [17, 29], (err, response) => {
              assert.isTrue(response.success);

              assert.equal(
                response.usBankAccountVerification.status,
                UsBankAccountVerification.StatusType.Verified
              );

              done();
            });
          });
        });
      });
    });

    it('successfully confirms not-yet-settled micro deposit amounts', function (done) {
      let customerParams = {};

      gateway.customer.create(customerParams, (err, response) => {
        let customerId = response.customer.id;

        specHelper.generateValidUsBankAccountNonce('1000000001', gateway, function (nonce) {
          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
              usBankAccountVerificationMethod: UsBankAccountVerification.VerificationMethod.MicroTransfers
            }
          };

          gateway.paymentMethod.create(paymentMethodParams, (err, response) => {
            assert.isNull(err);

            let usBankAccount = response.usBankAccount;

            assert.isFalse(usBankAccount.verified);

            let verification = usBankAccount.verifications[0];

            assert.equal(verification.verificationMethod, UsBankAccountVerification.VerificationMethod.MicroTransfers);
            assert.isNull(verification.verificationDeterminedAt);

            gateway.usBankAccountVerification.confirmMicroTransferAmounts(verification.id, [17, 29], (err, response) => {
              assert.isTrue(response.success);

              assert.equal(
                response.usBankAccountVerification.status,
                UsBankAccountVerification.StatusType.Pending
              );

              done();
            });
          });
        });
      });
    });

    it('tries to confirm a micro deposit amount', function (done) {
      let customerParams = {};

      gateway.customer.create(customerParams, (err, response) => {
        let customerId = response.customer.id;

        specHelper.generateValidUsBankAccountNonce('1000000000', gateway, function (nonce) {
          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
              usBankAccountVerificationMethod: UsBankAccountVerification.VerificationMethod.MicroTransfers
            }
          };

          gateway.paymentMethod.create(paymentMethodParams, (err, response) => {
            assert.isNull(err);

            let usBankAccount = response.usBankAccount;

            assert.isFalse(usBankAccount.verified);

            let verification = usBankAccount.verifications[0];

            assert.equal(verification.verificationMethod, UsBankAccountVerification.VerificationMethod.MicroTransfers);
            assert.isNull(verification.verificationDeterminedAt);

            gateway.usBankAccountVerification.confirmMicroTransferAmounts(verification.id, [1, 1], (err, response) => {
              assert.isFalse(response.success);

              assert.equal(
                response.errors.for('usBankAccountVerification').on('base')[0].code,
                ValidationErrorCodes.UsBankAccountVerification.AmountsDoNotMatch
              );

              done();
            });
          });
        });
      });
    });

    it('exceeds confirmation attempt threshold', function (done) {
      let customerParams = {};

      gateway.customer.create(customerParams, (err, response) => {
        let customerId = response.customer.id;

        specHelper.generateValidUsBankAccountNonce('1000000000', gateway, function (nonce) {
          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.AnotherUsBankMerchantAccount,
              usBankAccountVerificationMethod: UsBankAccountVerification.VerificationMethod.MicroTransfers
            }
          };

          gateway.paymentMethod.create(paymentMethodParams, (err, response) => {
            assert.isNull(err);

            let usBankAccount = response.usBankAccount;

            assert.isFalse(usBankAccount.verified);

            let verification = usBankAccount.verifications[0];

            assert.equal(verification.verificationMethod, UsBankAccountVerification.VerificationMethod.MicroTransfers);
            assert.isNull(verification.verificationDeterminedAt);

            gateway.usBankAccountVerification.confirmMicroTransferAmounts(verification.id, [1, 1], (err, response) => {
              assert.isFalse(response.success);

              gateway.usBankAccountVerification.confirmMicroTransferAmounts(verification.id, [1, 1], (err, response) => {
                assert.isFalse(response.success);

                gateway.usBankAccountVerification.confirmMicroTransferAmounts(verification.id, [1, 1], (err, response) => {
                  assert.isFalse(response.success);

                  gateway.usBankAccountVerification.confirmMicroTransferAmounts(verification.id, [1, 1], (err, response) => {
                    assert.isFalse(response.success);

                    gateway.usBankAccountVerification.confirmMicroTransferAmounts(verification.id, [1, 1], (err, response) => {
                      assert.isFalse(response.success);

                      assert.equal(
                        response.errors.for('usBankAccountVerification').on('base')[0].code,
                        ValidationErrorCodes.UsBankAccountVerification.TooManyConfirmationAttempts
                      );

                      assert.equal(response.usBankAccountVerification.status, UsBankAccountVerification.StatusType.GatewayRejected);

                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('find', function () {
    it('finds a verification', function (done) {
      let customerParams = {};

      specHelper.defaultGateway.customer.create(customerParams, (err, response) => {
        let customerId = response.customer.id;

        specHelper.generateValidUsBankAccountNonce('567891234', function (nonce) {
          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.UsBankMerchantAccount
            }
          };

          specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
            let usBankAccount = response.paymentMethod;

            assert.equal(usBankAccount.verifications.length, 1);

            let verification = usBankAccount.verifications[0];

            specHelper.defaultGateway.usBankAccountVerification.find(verification.id, function (err, foundVerification) {
              assert.isNull(err);
              assert.equal(verification.id, foundVerification.id);
              assert.equal(verification.verificationMethod, foundVerification.verificationMethod);

              done();
            });
          });
        });
      });
    });

    it('handles not finding a verification', done =>
      specHelper.defaultGateway.usBankAccountVerification.find('nonexistent_verification', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('handles whitespace ids', done =>
      specHelper.defaultGateway.usBankAccountVerification.find(' ', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });

  describe('search', function () {
    it('searches for a US bank account verification by text fields', function (done) {
      let customerParams = {
        email: 'dan.schulman@paypal.com'
      };

      specHelper.defaultGateway.customer.create(customerParams, (err, response) => {
        var customerId = response.customer.id;

        specHelper.generateValidUsBankAccountNonce('567891234', function (nonce) {
          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.UsBankMerchantAccount
            }
          };

          specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
            let usBankAccount = response.paymentMethod;
            let createdVerification = usBankAccount.verifications[0];

            specHelper.defaultGateway.usBankAccountVerification.search(function (search) {
              search.accountHolderName().is('Dan Schulman');
              search.customerEmail().is('dan.schulman@paypal.com');
              search.customerId().is(customerId);
              search.id().is(createdVerification.id);
              search.paymentMethodToken().is(usBankAccount.token);
              search.routingNumber().is(usBankAccount.routingNumber);

              return search;
            }

            , function (err, response) {
              assert.isNull(err);
              assert.equal(response.length(), 1);

              return response.first(function (err, foundVerification) {
                assert.equal(foundVerification.id, createdVerification.id);
                assert.equal(foundVerification.verificationMethod, createdVerification.verificationMethod);
                assert.equal(foundVerification.status, createdVerification.status);

                done();
              });
            });
          });
        });
      });
    });

    it('searches for multiple US bank account verifications by last4', function (done) {
      let customerParams = {};

      specHelper.defaultGateway.customer.create(customerParams, (err, response) => {
        let customerId = response.customer.id;

        specHelper.generateValidUsBankAccountNonce('567891234', function (nonce) {
          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: nonce,
            options: {
              verificationMerchantAccountId: MerchantAccountTest.UsBankMerchantAccount
            }
          };

          specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
            let usBankAccount = response.paymentMethod;

            let paymentMethodUpdateParams = {
              customerId,
              options: {
                verificationMerchantAccountId: MerchantAccountTest.UsBankMerchantAccount,
                usBankAccountVerificationMethod: UsBankAccountVerification.VerificationMethod.IndependentCheck
              }
            };

            specHelper.defaultGateway.paymentMethod.update(usBankAccount.token, paymentMethodUpdateParams, function (err, response) {
              assert.isNull(err);
              let verifications = response.paymentMethod.verifications;

              let createdIds = [];

              _.forEach(verifications, function (v) {
                createdIds.push(v.id);
              });

              specHelper.defaultGateway.usBankAccountVerification.search(function (search) {
                search.customerId().is(customerId);

                return search.accountNumber().endsWith('1234');
              }

              , function (err, response) {
                assert.isNull(err);
                assert.equal(response.length(), 2);

                createdIds.sort();
                response.ids.sort();

                assert.isTrue(_.isEqual(createdIds, response.ids));
                assert.equal(verifications[0].verificationMethod, UsBankAccountVerification.VerificationMethod.IndependentCheck);
                assert.equal(verifications[1].verificationMethod, UsBankAccountVerification.VerificationMethod.IndependentCheck);

                done();
              });
            });
          });
        });
      });
    });
  });
});
