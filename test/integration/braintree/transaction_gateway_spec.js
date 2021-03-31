'use strict';

let braintree = specHelper.braintree;
let Braintree = require('../../../lib/braintree');
let CreditCardNumbers = require('../../../lib/braintree/test_values/credit_card_numbers').CreditCardNumbers;
let Nonces = require('../../../lib/braintree/test_values/nonces').Nonces;
let VenmoSdk = require('../../../lib/braintree/test_values/venmo_sdk').VenmoSdk;
let CreditCard = require('../../../lib/braintree/credit_card').CreditCard;
let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;
let PaymentInstrumentTypes = require('../../../lib/braintree/payment_instrument_types').PaymentInstrumentTypes;
let Transaction = require('../../../lib/braintree/transaction').Transaction;
let Dispute = require('../../../lib/braintree/dispute').Dispute;
let Environment = require('../../../lib/braintree/environment').Environment;
let Config = require('../../../lib/braintree/config').Config;

describe('TransactionGateway', function () {
  describe('sale', function () {
    it('charges a card', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'sale');
        assert.equal(response.transaction.amount, '5.00');
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
        assert.isNull(response.transaction.voiceReferralNumber);
        assert.equal(response.transaction.processorResponseCode, '1000');
        assert.equal(response.transaction.processorResponseType, 'approved');
        assert.exists(response.transaction.authorizationExpiresAt);

        done();
      });
    });

    it('passes scaExemption', function (done) {
      let requestedExemption = 'low_value';
      let transactionParams = {
        amount: '5.00',
        scaExemption: requestedExemption,
        creditCard: {
          number: '4023490000000008',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.scaExemptionRequested, requestedExemption);

        done();
      });
    });

    it('handles scaExemption validation errors', function (done) {
      let transactionParams = {
        amount: '5.00',
        scaExemption: 'invalid_sca_exemption',
        creditCard: {
          number: '4023490000000008',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('transaction').on('scaExemption')[0].code,
          ValidationErrorCodes.Transaction.ScaExemptionIsInvalid
        );

        done();
      });
    });

    it('charges a card with billing and shipping address specified', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        billing: {
          streetAddress: '123 Fake St',
          extendedAddress: 'Suite 403',
          locality: 'Chicago',
          region: 'IL',
          postalCode: '60607',
          phoneNumber: '122-555-1237',
          countryName: 'United States of America'
        },
        shipping: {
          streetAddress: '456 W Main St',
          extendedAddress: 'Apt 2F',
          locality: 'Bartlett',
          region: 'IL',
          phoneNumber: '122-555-1236',
          postalCode: '60103',
          countryName: 'Mexico',
          shippingMethod: 'electronic'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'sale');
        assert.equal(response.transaction.amount, '5.00');
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
        assert.isNull(response.transaction.voiceReferralNumber);
        assert.equal(response.transaction.processorResponseCode, '1000');
        assert.equal(response.transaction.processorResponseType, 'approved');
        assert.exists(response.transaction.authorizationExpiresAt);

        done();
      });
    });

    it('handles an error when shipping phone number is invalid', function (done) {
      let transactionParams = {
        type: 'sale',
        amount: '64.05',
        paymentMethodNonce: Nonces.AbstractTransactable,
        shipping: {
          streetAddress: '456 W Main St',
          extendedAddress: 'Apt 2F',
          locality: 'Bartlett',
          region: 'IL',
          phoneNumber: '123-234-3456=098765',
          postalCode: '60103',
          countryName: 'Mexico',
          shippingMethod: 'electronic'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').for('shipping').on('phoneNumber')[0].code,
          ValidationErrorCodes.Transaction.ShippingPhoneNumberIsInvalid
        );
        done();
      });
    });

    it('handles an error when shipping method is invalid', function (done) {
      let transactionParams = {
        type: 'sale',
        amount: '64.05',
        paymentMethodNonce: Nonces.AbstractTransactable,
        shipping: {
          streetAddress: '456 W Main St',
          extendedAddress: 'Apt 2F',
          locality: 'Bartlett',
          region: 'IL',
          phoneNumber: '122-555-1236',
          postalCode: '60103',
          countryName: 'Mexico',
          shippingMethod: 'urgent'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').for('shipping').on('shippingMethod')[0].code,
          ValidationErrorCodes.Transaction.ShippingMethodIsInvalid
        );
        done();
      });
    });

    it('handles an error when billing phone number is invalid', function (done) {
      let transactionParams = {
        type: 'sale',
        amount: '64.05',
        paymentMethodNonce: Nonces.AbstractTransactable,
        billing: {
          streetAddress: '456 W Main St',
          extendedAddress: 'Apt 2F',
          locality: 'Bartlett',
          region: 'IL',
          phoneNumber: '123-234-3456=098765',
          postalCode: '60103',
          countryName: 'Mexico'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').for('billing').on('phoneNumber')[0].code,
          ValidationErrorCodes.Transaction.BillingPhoneNumberIsInvalid
        );
        done();
      });
    });

    it('handles an error when product sku is invalid', function (done) {
      let transactionParams = {
        type: 'sale',
        amount: '64.05',
        paymentMethodNonce: Nonces.AbstractTransactable,
        productSku: 'product$ku!'
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').on('productSku')[0].code,
          ValidationErrorCodes.Transaction.ProductSkuIsInvalid
        );
        done();
      });
    });

    it('charges an elo card', function (done) {
      let transactionParams = {
        merchantAccountId: 'adyen_ma',
        amount: '5.00',
        creditCard: {
          number: '5066991111111118',
          expirationDate: '10/20',
          cvv: '737'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'sale');
        assert.equal(response.transaction.amount, '5.00');
        assert.equal(response.transaction.creditCard.maskedNumber, '506699******1118');
        assert.isNull(response.transaction.voiceReferralNumber);

        done();
      });
    });

    it('charges with account_type debit', function (done) {
      let transactionParams = {
        merchantAccountId: 'hiper_brl',
        amount: '5.00',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: '10/20',
          cvv: '737'
        },
        options: {
          submitForSettlement: true,
          creditCard: {
            accountType: 'debit'
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'sale');
        assert.equal(response.transaction.creditCard.accountType, 'debit');

        done();
      });
    });

    it('handles error AccountTypeIsInvalid', function (done) {
      let transactionParams = {
        merchantAccountId: 'hiper_brl',
        amount: '5.00',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: '10/20',
          cvv: '737'
        },
        options: {
          submitForSettlement: true,
          creditCard: {
            accountType: 'ach'
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(response.errors.for('transaction').for('options').for('creditCard').on('accountType')[0].code, ValidationErrorCodes.Transaction.Options.CreditCard.AccountTypeIsInvalid);

        done();
      });
    });

    it('handles error AccountTypeNotSupported', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '10/20',
          cvv: '737'
        },
        options: {
          submitForSettlement: true,
          creditCard: {
            accountType: 'debit'
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(response.errors.for('transaction').for('options').for('creditCard').on('accountType')[0].code, ValidationErrorCodes.Transaction.Options.CreditCard.AccountTypeNotSupported);

        done();
      });
    });

    it('handles error AccountTypeDebitDoesNotSupportAuths', function (done) {
      let transactionParams = {
        merchantAccountId: 'hiper_brl',
        amount: '5.00',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: '10/20',
          cvv: '737'
        },
        options: {
          submitForSettlement: false,
          creditCard: {
            accountType: 'debit'
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(response.errors.for('transaction').for('options').for('creditCard').on('accountType')[0].code, ValidationErrorCodes.Transaction.Options.CreditCard.AccountTypeDebitDoesNotSupportAuths);

        done();
      });
    });

    it('handles error AmountNotSupportedByProcessor', function (done) {
      let transactionParams = {
        merchantAccountId: 'hiper_brl',
        amount: '0.20',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: '10/20',
          cvv: '737'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(response.errors.for('transaction').on('amount')[0].code, ValidationErrorCodes.Transaction.AmountNotSupportedByProcessor);

        done();
      });
    });

    it('charges a card using an access token', function (done) {
      let oauthGateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      specHelper.createToken(oauthGateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, function (err, response) {
        let gateway = new braintree.BraintreeGateway({
          accessToken: response.credentials.accessToken
        });

        let transactionParams = {
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        };

        return gateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'sale');
          assert.equal(response.transaction.amount, '5.00');
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
          assert.isNull(response.transaction.voiceReferralNumber);

          done();
        });
      });
    });

    it('can use a customer from the vault', function (done) {
      let customerParams = {
        firstName: 'Adam',
        lastName: 'Jones',
        creditCard: {
          cardholderName: 'Adam Jones',
          number: '5105105105105100',
          expirationDate: '05/2014'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let transactionParams = {
          customerId: response.customer.id,
          amount: '100.00'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'sale');
          assert.equal(response.transaction.customer.firstName, 'Adam');
          assert.equal(response.transaction.customer.lastName, 'Jones');
          assert.equal(response.transaction.creditCard.cardholderName, 'Adam Jones');
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
          assert.equal(response.transaction.creditCard.expirationDate, '05/2014');

          done();
        });
      });
    });

    it('can use a credit card from the vault', function (done) {
      let customerParams = {
        firstName: 'Adam',
        lastName: 'Jones',
        creditCard: {
          cardholderName: 'Adam Jones',
          number: '5105105105105100',
          expirationDate: '05/2014'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let transactionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          amount: '100.00'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'sale');
          assert.equal(response.transaction.customer.firstName, 'Adam');
          assert.equal(response.transaction.customer.lastName, 'Jones');
          assert.equal(response.transaction.creditCard.cardholderName, 'Adam Jones');
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
          assert.equal(response.transaction.creditCard.expirationDate, '05/2014');

          done();
        });
      });
    });

    it('returns payment_instrument_type for credit_card', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.CreditCard);

        done();
      });
    });

    it('calls callback with an error when options object contains invalid keys', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          fakeData: 'some non-matching param value',
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err) {
        assert.equal(err.type, 'invalidKeysError');
        assert.equal(err.message, 'These keys are invalid: creditCard[fakeData]');
        done();
      });
    });

    it('skips advanced fraud checking if transaction[options][skip_advanced_fraud_checking] is set to true', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          skipAdvancedFraudChecking: true
        }
      };

      specHelper.advancedFraudKountGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.isUndefined(response.transaction.riskData);
        done();
      });
    });

    it('can serialize response object without gateway property on transaction', function (done) {
      let transactionParams = {
        amount: '5.00',
        paymentMethodNonce: 'fake-valid-nonce',
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        var serializedObject, parsedObject;

        try {
          serializedObject = JSON.stringify(response);
          parsedObject = JSON.parse(serializedObject);
        } catch (e) {
          // should not get here
          done(e);

          return;
        }

        assert.isString(serializedObject);
        assert.equal(response.transaction.id, parsedObject.transaction.id);

        done();
      });
    });

    context('level 3 summary values', function () {
      it('allows creation with level 3 summary values provided', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          discountAmount: '1.00',
          shippingAmount: '2.00',
          shipsFromPostalCode: '12345'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.discountAmount, '1.00');
          assert.equal(response.transaction.shippingAmount, '2.00');
          assert.equal(response.transaction.shipsFromPostalCode, '12345');
          done();
        });
      });

      it('returns an error for transaction when discount amount format is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          discountAmount: '123.456'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('discountAmount')[0].code,
            ValidationErrorCodes.Transaction.DiscountAmountFormatIsInvalid
          );
          done();
        });
      });

      it('returns an error for transaction when discount amount cannot be negative', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          discountAmount: '-2.00'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('discountAmount')[0].code,
            ValidationErrorCodes.Transaction.DiscountAmountCannotBeNegative
          );
          done();
        });
      });

      it('returns an error for transaction when discount amount is too large', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          discountAmount: '2147483647'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('discountAmount')[0].code,
            ValidationErrorCodes.Transaction.DiscountAmountIsTooLarge
          );
          done();
        });
      });

      it('returns an error for transaction when shipping amount format is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          shippingAmount: '1a00'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('shippingAmount')[0].code,
            ValidationErrorCodes.Transaction.ShippingAmountFormatIsInvalid
          );
          done();
        });
      });

      it('returns an error for transaction when shipping amount cannot be negative', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          shippingAmount: '-1.00'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('shippingAmount')[0].code,
            ValidationErrorCodes.Transaction.ShippingAmountCannotBeNegative
          );
          done();
        });
      });

      it('returns an error for transaction when shipping amount is too large', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          shippingAmount: '2147483647'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('shippingAmount')[0].code,
            ValidationErrorCodes.Transaction.ShippingAmountIsTooLarge
          );
          done();
        });
      });

      it('returns an error for transaction when ships from postal code is too long', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          shipsFromPostalCode: '12345678901'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('shipsFromPostalCode')[0].code,
            ValidationErrorCodes.Transaction.ShipsFromPostalCodeIsTooLong
          );
          done();
        });
      });

      it('returns an error for transaction when ships from postal code invalid characters', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '64.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          shipsFromPostalCode: '1$345'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('shipsFromPostalCode')[0].code,
            ValidationErrorCodes.Transaction.ShipsFromPostalCodeInvalidCharacters
          );
          done();
        });
      });
    });

    context('line items', function () {
      it('allows creation with empty line items and returns none', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: []
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          specHelper.defaultGateway.transactionLineItem.findAll(response.transaction.id, function (err, response) {
            assert.deepEqual(response, []);
            done();
          });
        });
      });

      it('allows creation with single line item with minimal fields and returns it', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '45.15',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.0232',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              totalAmount: '45.15'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          specHelper.defaultGateway.transactionLineItem.findAll(response.transaction.id, function (err, response) {
            assert.equal(response.length, 1);
            let lineItem = response[0];

            assert.equal(lineItem.quantity, '1.0232');
            assert.equal(lineItem.name, 'Name #1');
            assert.equal(lineItem.kind, 'debit');
            assert.equal(lineItem.unitAmount, '45.1232');
            assert.equal(lineItem.totalAmount, '45.15');
            done();
          });
        });
      });

      it('returns line items directly from a transaction', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '45.15',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.0232',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              totalAmount: '45.15'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          let transaction = response.transaction;

          transaction.lineItems(function (err, response) {
            assert.equal(response.length, 1);
            let lineItem = response[0];

            assert.equal(lineItem.quantity, '1.0232');
            assert.equal(lineItem.name, 'Name #1');
            assert.equal(lineItem.kind, 'debit');
            assert.equal(lineItem.unitAmount, '45.1232');
            assert.equal(lineItem.totalAmount, '45.15');
            done();
          });
        });
      });

      it('allows creation with single line item with zero amount fields', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '45.15',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.0232',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              totalAmount: '45.15',
              discountAmount: '0',
              taxAmount: '0',
              unitTaxAmount: '0'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          specHelper.defaultGateway.transactionLineItem.findAll(response.transaction.id, function (err, response) {
            assert.equal(response.length, 1);
            let lineItem = response[0];

            assert.equal(lineItem.discountAmount, '0.00');
            assert.equal(lineItem.taxAmount, '0.00');
            assert.equal(lineItem.unitTaxAmount, '0.00');
            done();
          });
        });
      });

      it('allows creation with single line item and returns it', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '45.15',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.0232',
              name: 'Name #1',
              description: 'Description #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitTaxAmount: '1.23',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              taxAmount: '1.24',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724',
              url: 'https://example.com/products/23434'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          specHelper.defaultGateway.transactionLineItem.findAll(response.transaction.id, function (err, response) {
            assert.equal(response.length, 1);
            let lineItem = response[0];

            assert.equal(lineItem.quantity, '1.0232');
            assert.equal(lineItem.name, 'Name #1');
            assert.equal(lineItem.description, 'Description #1');
            assert.equal(lineItem.kind, 'debit');
            assert.equal(lineItem.unitAmount, '45.1232');
            assert.equal(lineItem.unitTaxAmount, '1.23');
            assert.equal(lineItem.unitOfMeasure, 'gallon');
            assert.equal(lineItem.discountAmount, '1.02');
            assert.equal(lineItem.taxAmount, '1.24');
            assert.equal(lineItem.totalAmount, '45.15');
            assert.equal(lineItem.productCode, '23434');
            assert.equal(lineItem.commodityCode, '9SAASSD8724');
            assert.equal(lineItem.url, 'https://example.com/products/23434');
            done();
          });
        });
      });

      it('allows creation with multiple line items and returns them', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.0232',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              taxAmount: '0.11',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '2.02',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '5',
              unitOfMeasure: 'gallon',
              totalAmount: '10.1'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          specHelper.defaultGateway.transactionLineItem.findAll(response.transaction.id, function (err, response) {
            assert.equal(response.length, 2);

            let lineItem1 = response.find(function (lineItem) {
              return lineItem.name === 'Name #1';
            });

            assert.equal(lineItem1.quantity, '1.0232');
            assert.equal(lineItem1.name, 'Name #1');
            assert.equal(lineItem1.kind, 'debit');
            assert.equal(lineItem1.unitAmount, '45.1232');
            assert.equal(lineItem1.unitOfMeasure, 'gallon');
            assert.equal(lineItem1.discountAmount, '1.02');
            assert.equal(lineItem1.taxAmount, '0.11');
            assert.equal(lineItem1.totalAmount, '45.15');
            assert.equal(lineItem1.productCode, '23434');
            assert.equal(lineItem1.commodityCode, '9SAASSD8724');

            let lineItem2 = response.find(function (lineItem) {
              return lineItem.name === 'Name #2';
            });

            assert.equal(lineItem2.quantity, '2.02');
            assert.equal(lineItem2.name, 'Name #2');
            assert.equal(lineItem2.kind, 'credit');
            assert.equal(lineItem2.unitAmount, '5');
            assert.equal(lineItem2.unitOfMeasure, 'gallon');
            assert.equal(lineItem2.totalAmount, '10.10');
            assert.equal(lineItem2.discountAmount, null);
            assert.equal(lineItem2.taxAmount, null);
            assert.equal(lineItem2.productCode, null);
            assert.equal(lineItem2.commodityCode, null);
            done();
          });
        });
      });

      it('handles validation error commodity code is too long', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '1234567890123'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('commodityCode')[0].code, ValidationErrorCodes.Transaction.LineItem.CommodityCodeIsTooLong);
          done();
        });
      });

      it('handles validation error description is too long', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              description: 'X'.repeat(128),
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('description')[0].code, ValidationErrorCodes.Transaction.LineItem.DescriptionIsTooLong);
          done();
        });
      });

      it('handles validation error discount amount format is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '$1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('discountAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.DiscountAmountFormatIsInvalid);
          done();
        });
      });

      it('handles validation error discount amount is too large', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '2147483648',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('discountAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.DiscountAmountIsTooLarge);
          done();
        });
      });

      it('handles validation error discount amount cannot be negative', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '-2',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('discountAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.DiscountAmountCannotBeNegative);
          done();
        });
      });

      it('handles validation error kind is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'sale',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('kind')[0].code, ValidationErrorCodes.Transaction.LineItem.KindIsInvalid);
          done();
        });
      });

      it('handles validation error kind is required', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('kind')[0].code, ValidationErrorCodes.Transaction.LineItem.KindIsRequired);
          done();
        });
      });

      it('handles validation error name is required', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('name')[0].code, ValidationErrorCodes.Transaction.LineItem.NameIsRequired);
          done();
        });
      });

      it('handles validation error name is too long', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'X'.repeat(36),
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('name')[0].code, ValidationErrorCodes.Transaction.LineItem.NameIsTooLong);
          done();
        });
      });

      it('handles validation error product code is too long', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '1234567890123',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('productCode')[0].code, ValidationErrorCodes.Transaction.LineItem.ProductCodeIsTooLong);
          done();
        });
      });

      it('handles validation error quantity format is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1,2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('quantity')[0].code, ValidationErrorCodes.Transaction.LineItem.QuantityFormatIsInvalid);
          done();
        });
      });

      it('handles validation error quantity is required', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('quantity')[0].code, ValidationErrorCodes.Transaction.LineItem.QuantityIsRequired);
          done();
        });
      });

      it('handles validation error quantity is too large', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '2147483648',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('quantity')[0].code, ValidationErrorCodes.Transaction.LineItem.QuantityIsTooLarge);
          done();
        });
      });

      it('handles validation error total amount format is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '$45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('totalAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.TotalAmountFormatIsInvalid);
          done();
        });
      });

      it('handles validation error total amount is required', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('totalAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.TotalAmountIsRequired);
          done();
        });
      });

      it('handles validation error total amount is too large', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '2147483648',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('totalAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.TotalAmountIsTooLarge);
          done();
        });
      });

      it('handles validation error total amount must be greater than zero', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '-2',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('totalAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.TotalAmountMustBeGreaterThanZero);
          done();
        });
      });

      it('handles validation error unit amount format is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.01232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('unitAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.UnitAmountFormatIsInvalid);
          done();
        });
      });

      it('handles validation error unit amount is required', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('unitAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.UnitAmountIsRequired);
          done();
        });
      });

      it('handles validation error unit amount is too large', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '2147483648',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('unitAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.UnitAmountIsTooLarge);
          done();
        });
      });

      it('handles validation error unit amount must be greater than zero', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '-2',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('unitAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.UnitAmountMustBeGreaterThanZero);
          done();
        });
      });

      it('handles validation error unit of measure is too long', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.1232',
              unitOfMeasure: '1234567890123',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('unitOfMeasure')[0].code, ValidationErrorCodes.Transaction.LineItem.UnitOfMeasureIsTooLong);
          done();
        });
      });

      it('handles validation error unit tax amount format is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitTaxAmount: '2.34',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.0122',
              unitTaxAmount: '2.012',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('unitTaxAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.UnitTaxAmountFormatIsInvalid);
          done();
        });
      });

      it('handles validation error unit tax amount is too large', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitTaxAmount: '1.23',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.0122',
              unitTaxAmount: '2147483648',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('unitTaxAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.UnitTaxAmountIsTooLarge);
          done();
        });
      });

      it('handles validation error unit tax amount cannot be negative', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            },
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.0122',
              unitTaxAmount: '-1.23',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index1').on('unitTaxAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.UnitTaxAmountCannotBeNegative);
          done();
        });
      });

      it('handles validation error tax amount format is invalid', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.0122',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              taxAmount: '2.012',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index0').on('taxAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.TaxAmountFormatIsInvalid);
          done();
        });
      });

      it('handles validation error tax amount is too large', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.0122',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              taxAmount: '2147483648',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index0').on('taxAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.TaxAmountIsTooLarge);
          done();
        });
      });

      it('handles validation error tax amount cannot be negative', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '1.2322',
              name: 'Name #2',
              kind: 'credit',
              unitAmount: '45.0122',
              unitOfMeasure: 'gallon',
              discountAmount: '1.02',
              taxAmount: '-1.23',
              totalAmount: '45.15',
              productCode: '23434',
              commodityCode: '9SAASSD8724'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('lineItems').for('index0').on('taxAmount')[0].code, ValidationErrorCodes.Transaction.LineItem.TaxAmountCannotBeNegative);
          done();
        });
      });

      it('handles validation errors on line items structure', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: {
            quantity: '2.02',
            name: 'Name #2',
            kind: 'credit',
            unitAmount: '5',
            unitOfMeasure: 'gallon',
            totalAmount: '10.1'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('lineItems')[0].code, ValidationErrorCodes.Transaction.LineItemsExpected);
          done();
        });
      });

      it('handles invalid arguments on line items structure', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: [
            {
              quantity: '2.02',
              name: 'Name #1',
              kind: 'credit',
              unitAmount: '5',
              unitOfMeasure: 'gallon',
              totalAmount: '10.1'
            },
            ['Name #2'],
            {
              quantity: '2.02',
              name: 'Name #3',
              kind: 'credit',
              unitAmount: '5',
              unitOfMeasure: 'gallon',
              totalAmount: '10.1'
            }
          ]
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.equal(err.type, 'invalidKeysError');
          assert.equal(err.message, 'These keys are invalid: lineItems[0]');
          assert.equal(response, null);
          done();
        });
      });

      it('handles validation errors on too many line items', function (done) {
        let transactionParams = {
          type: 'sale',
          amount: '35.05',
          paymentMethodNonce: Nonces.AbstractTransactable,
          lineItems: []
        };

        for (let i = 0; i < 250; i++) {
          transactionParams.lineItems.push({
            quantity: '2.02',
            name: 'Line item ##{i}',
            kind: 'credit',
            unitAmount: '5',
            unitOfMeasure: 'gallon',
            totalAmount: '10.1'
          });
        }
        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('lineItems')[0].code, ValidationErrorCodes.Transaction.TooManyLineItems);
          done();
        });
      });
    });

    context('network response code/text', function () {
      it('returns network response code/text', function (done) {
        let transactionParams = {
          amount: '5.00',
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/12'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'sale');
          assert.equal(response.transaction.amount, '5.00');
          assert.equal(response.transaction.processorResponseCode, '1000');
          assert.equal(response.transaction.processorResponseType, 'approved');
          assert.exists(response.transaction.authorizationExpiresAt);
          assert.equal(response.transaction.networkResponseCode, 'XX');
          assert.equal(response.transaction.networkResponseText, 'sample network response text');

          done();
        });
      });
    });

    context('network transaction id', function () {
      it('support visa', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '4111111111111111',
              expirationDate: '05/12'
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.transaction.networkTransactionId);
            done();
          });
        });
      });

      it('supports mastercard', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '5555555555554444',
              expirationDate: '05/12'
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.transaction.networkTransactionId);
            done();
          });
        });
      });

      it('supports amex', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '371260714673002',
              expirationDate: '05/12'
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.transaction.networkTransactionId);
            done();
          });
        });
      });
    });

    context('external vault', function () {
      it('supports status with visa', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '4111111111111111',
              expirationDate: '05/12'
            },
            externalVault: {
              status: Transaction.ExternalVault.WillVault
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.transaction.networkTransactionId);
            done();
          });
        });
      });

      it('supports status with amex', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '371260714673002',
              expirationDate: '05/12'
            },
            externalVault: {
              status: Transaction.ExternalVault.WillVault
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.transaction.networkTransactionId);
            done();
          });
        });
      });

      it('supports null previousNetworkTransactionId with non-visa', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '3530111333300000',
              expirationDate: '05/12'
            },
            externalVault: {
              status: Transaction.ExternalVault.Vaulted,
              previousNetworkTransactionId: null
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNull(response.transaction.networkTransactionId);
            done();
          });
        });
      });

      it('supports previousNetworkTransactionId', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '4111111111111111',
              expirationDate: '05/12'
            },
            externalVault: {
              status: Transaction.ExternalVault.Vaulted,
              previousNetworkTransactionId: '123456789012345'
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.transaction.networkTransactionId);
            done();
          });
        });
      });

      it('supports status vaulted without previousNetworkTransactionId', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.0',
            creditCard: {
              number: '4111111111111111',
              expirationDate: '05/12'
            },
            externalVault: {
              status: Transaction.ExternalVault.Vaulted
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.transaction.networkTransactionId);
            done();
          });
        });
      });

      it('handles validation error unsupported payment instrument type', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            paymentMethodNonce: Nonces.ApplyPayVisa,
            externalVault: {
              status: Transaction.ExternalVault.Vaulted,
              previousNetworkTransactionId: '123456789012345'
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success);
            assert.equal(response.errors.for('transaction').on('externalVault')[0].code, ValidationErrorCodes.Transaction.PaymentInstrumentWithExternalVaultIsInvalid);
            done();
          });
        });
      });

      it('handles validation error status is invalid', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '4111111111111111',
              expirationDate: '05/12'
            },
            externalVault: {
              status: 'bad value'
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success);
            assert.equal(response.errors.for('transaction').for('externalVault').on('status')[0].code, ValidationErrorCodes.Transaction.ExternalVault.StatusIsInvalid);
            done();
          });
        });
      });

      it('handles validation error status with previous network transaction id is invalid', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            amount: '10.00',
            creditCard: {
              number: '4111111111111111',
              expirationDate: '05/12'
            },
            externalVault: {
              status: Transaction.ExternalVault.WillVault,
              previousNetworkTransactionId: '123456789012345'
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success);
            assert.equal(response.errors.for('transaction').for('externalVault').on('status')[0].code, ValidationErrorCodes.Transaction.ExternalVault.StatusWithPreviousNetworkTransactionIdIsInvalid);
            done();
          });
        });
      });
    });

    context('with paypal here', function () {
      it('sets PayPalHere attributes on the transaction for auth captures', done =>
        specHelper.defaultGateway.transaction.find('paypal_here_auth_capture_id', function (err, transaction) {
          assert.equal(transaction.paymentInstrumentType, PaymentInstrumentTypes.PayPalHere);

          assert.isNotNull(transaction.paypalHereDetails);
          assert.isNotNull(transaction.paypalHereDetails.authorizationId);
          assert.isNotNull(transaction.paypalHereDetails.captureId);
          assert.isNotNull(transaction.paypalHereDetails.invoiceId);
          assert.isNotNull(transaction.paypalHereDetails.last4);
          assert.isNotNull(transaction.paypalHereDetails.paymentType);
          assert.isNotNull(transaction.paypalHereDetails.transactionFeeAmount);
          assert.isNotNull(transaction.paypalHereDetails.transactionFeeCurrencyIsoCode);
          assert.isNotNull(transaction.paypalHereDetails.transactionInitiationDate);
          assert.isNotNull(transaction.paypalHereDetails.transactionUpdatedDate);

          done();
        })
      );
      it('sets PayPalHere attributes on the transaciton for sales', done =>
        specHelper.defaultGateway.transaction.find('paypal_here_sale_id', function (err, transaction) {
          assert.isNotNull(transaction.paypalhereDetails);
          assert.isNotNull(transaction.paypalHereDetails.paymentId);

          done();
        })
      );
      it('sets PayPayHere attributes on the transaction for refunds', done =>
        specHelper.defaultGateway.transaction.find('paypal_here_refund_id', function (err, transaction) {
          assert.isNotNull(transaction.paypalHereDetails);
          assert.isNotNull(transaction.paypalHereDetails.refundId);

          done();
        })
      );
    });

    context('with apple pay', () => {
      it('returns ApplePayCard for payment_instrument when Apple Pay nonce is provided', done => {
        let transactionParams = {
          paymentMethodNonce: Nonces.ApplePayAmEx,
          amount: '100.00'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.ApplePayCard);
          assert.isNotNull(response.transaction.applePayCard.cardType);
          assert.isNotNull(response.transaction.applePayCard.paymentInstrumentName);

          done();
        });
      });

      it('returns ApplePayCard for payment_instrument when Apple Pay params are provided', done => {
        let transactionParams = {
          amount: '100.00',
          applePayCard: {
            cardholderName: 'Adam Davis',
            cryptogram: 'AAAAAAAA/COBt84dnIEcwAA3gAAGhgEDoLABAAhAgAABAAAALnNCLw==',
            eciIndicator: '07',
            expirationMonth: '05',
            expirationYear: '14',
            number: '4111111111111111'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.ApplePayCard);
          assert.isNotNull(response.transaction.applePayCard.cardType);
          assert.isNotNull(response.transaction.applePayCard.paymentInstrumentName);

          done();
        });
      });
    });

    context('with android pay proxy card', () =>
      it('returns AndroidPayCard for payment_instrument', done =>
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            paymentMethodNonce: Nonces.AndroidPayDiscover,
            amount: '100.00'
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.AndroidPayCard);
            assert.isString(response.transaction.androidPayCard.googleTransactionId);
            assert.equal(response.transaction.androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.Discover);
            assert.equal(response.transaction.androidPayCard.last4, '1117');
            assert.isFalse(response.transaction.androidPayCard.isNetworkTokenized);

            done();
          });
        })
      )
    );

    context('with android pay network token', () =>
      it('returns AndroidPayCard for payment_instrument', done =>
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            paymentMethodNonce: Nonces.AndroidPayMasterCard,
            amount: '100.00'
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.AndroidPayCard);
            assert.isString(response.transaction.androidPayCard.googleTransactionId);
            assert.equal(response.transaction.androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.MasterCard);
            assert.equal(response.transaction.androidPayCard.last4, '4444');
            assert.isTrue(response.transaction.androidPayCard.isNetworkTokenized);

            done();
          });
        })
      )
    );

    context('with venmo account', function () {
      it('returns VenmoAccount for payment_instrument', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            paymentMethodNonce: Nonces.VenmoAccount,
            merchantAccountId: specHelper.fakeVenmoAccountMerchantAccountId,
            amount: '100.00'
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            done();
          });
        });
      });

      it('supports profile_id', function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            paymentMethodNonce: Nonces.VenmoAccount,
            merchantAccountId: specHelper.fakeVenmoAccountMerchantAccountId,
            amount: '100.00',
            options: {
              venmo: {
                profileId: 'integration_venmo_merchant_public_id'
              }
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.VenmoAccount);
            assert.equal(response.transaction.venmoAccount.username, 'venmojoe');
            assert.equal(response.transaction.venmoAccount.venmoUserId, 'Venmo-Joe-1');

            done();
          });
        });
      });

      it('handles token issuance rejection', function (done) {
        let transactionParams = {
          amount: '10.0',
          paymentMethodNonce: Nonces.VenmoAccountTokenIssuanceError,
          merchantAccountId: specHelper.fakeVenmoAccountMerchantAccountId
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.transaction.status, Transaction.Status.GatewayRejected);
          assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.TokenIssuance);
          done();
        });
      });
    });

    it('successfully creates a paypal transaction with local payment webhook content', done =>
      specHelper.defaultGateway.customer.create({}, function () {
        let transactionParams = {
          amount: '100.00',
          options: {
            submitForSettlement: true
          },
          paypalAccount: {
            payerId: 'PAYER-123',
            paymentId: 'PAY-1234'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.PayPalAccount);
          assert.equal(response.transaction.paypalAccount.payerId, 'PAYER-123');
          assert.equal(response.transaction.paypalAccount.paymentId, 'PAY-1234');

          done();
        });
      })
    );

    context('with a local payment', function () {
      it('returns relevant local payment transaction details for a sale', done =>
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            paymentMethodNonce: Nonces.LocalPayment,
            amount: '100.00',
            options: {
              submitForSettlement: true
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.LocalPayment);
            assert.isString(response.transaction.localPayment.payerId);
            assert.isString(response.transaction.localPayment.paymentId);
            assert.isString(response.transaction.localPayment.fundingSource);
            assert.isString(response.transaction.localPayment.captureId);
            assert.isString(response.transaction.localPayment.debugId);
            assert.isNotNull(response.transaction.localPayment.transactionFeeAmount);
            assert.isString(response.transaction.localPayment.transactionFeeCurrencyIsoCode);

            done();
          });
        })
      );

      it('returns relevant local payment transaction details for a refund', done =>
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            paymentMethodNonce: Nonces.LocalPayment,
            amount: '100.00',
            options: {
              submitForSettlement: true
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            specHelper.defaultGateway.transaction.refund(response.transaction.id, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.LocalPayment);
              assert.isString(response.transaction.localPayment.payerId);
              assert.isString(response.transaction.localPayment.paymentId);
              assert.isString(response.transaction.localPayment.fundingSource);
              assert.isString(response.transaction.localPayment.refundId);
              assert.isString(response.transaction.localPayment.debugId);
              assert.isNotNull(response.transaction.localPayment.refundFromTransactionFeeAmount);
              assert.isString(response.transaction.localPayment.refundFromTransactionFeeCurrencyIsoCode);
            });

            done();
          });
        })
      );
    });

    context('with a paypal acount', function () {
      it('returns PayPalAccount for payment_instrument', done =>
        specHelper.defaultGateway.customer.create({}, function () {
          let transactionParams = {
            paymentMethodNonce: Nonces.PayPalOneTimePayment,
            amount: '100.00'
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.PayPalAccount);

            done();
          });
        })
      );

      context('as a vaulted payment method', () =>
        it('successfully creates a transaction', done =>
          specHelper.defaultGateway.customer.create({}, function (err, response) {
            let customerId = response.customer.id;
            let nonceParams = {
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE',
                token: `PAYPAL_ACCOUNT_${specHelper.randomId()}`
              }
            };

            specHelper.generateNonceForNewPaymentMethod(nonceParams, customerId, function (nonce) {
              let paymentMethodParams = {
                paymentMethodNonce: nonce,
                customerId
              };

              specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
                let paymentMethodToken = response.paymentMethod.token;

                let transactionParams = {
                  paymentMethodToken,
                  amount: '100.00'
                };

                specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.transaction.type, 'sale');
                  assert.isString(response.transaction.paypalAccount.payerEmail);
                  assert.isString(response.transaction.paypalAccount.authorizationId);
                  assert.isString(response.transaction.paypalAccount.imageUrl);
                  assert.isString(response.transaction.paypalAccount.debugId);

                  done();
                });
              });
            });
          })
        )
      );

      context('as a payment method nonce authorized for future payments', function () {
        it("successfully creates a transaction but doesn't vault a paypal account", function (done) {
          let paymentMethodToken = `PAYPAL_ACCOUNT_${specHelper.randomId()}`;

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

          specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;
            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE',
                token: paymentMethodToken
              }
            };

            return myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', params, function (statusCode, body) {
              let nonce = JSON.parse(body).paypalAccounts[0].nonce;

              specHelper.defaultGateway.customer.create({}, function () {
                let transactionParams = {
                  paymentMethodNonce: nonce,
                  amount: '100.00'
                };

                specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.transaction.type, 'sale');
                  assert.isNull(response.transaction.paypalAccount.token);
                  assert.isString(response.transaction.paypalAccount.payerEmail);
                  assert.isString(response.transaction.paypalAccount.authorizationId);
                  assert.isString(response.transaction.paypalAccount.debugId);

                  specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function (err) {
                    assert.equal(err.type, braintree.errorTypes.notFoundError);

                    done();
                  });
                });
              });
            });
          });
        });

        it('vaults when explicitly asked', function (done) {
          let paymentMethodToken = `PAYPAL_ACCOUNT_${specHelper.randomId()}`;

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

          specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;
            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE',
                token: paymentMethodToken
              }
            };

            return myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', params, function (statusCode, body) {
              let nonce = JSON.parse(body).paypalAccounts[0].nonce;

              specHelper.defaultGateway.customer.create({}, function () {
                let transactionParams = {
                  paymentMethodNonce: nonce,
                  amount: '100.00',
                  options: {
                    storeInVault: true
                  }
                };

                specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.transaction.type, 'sale');
                  assert.equal(response.transaction.paypalAccount.token, paymentMethodToken);
                  assert.isString(response.transaction.paypalAccount.payerEmail);
                  assert.isString(response.transaction.paypalAccount.authorizationId);
                  assert.isString(response.transaction.paypalAccount.debugId);

                  specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function (err) {
                    assert.isNull(err);

                    done();
                  });
                });
              });
            });
          });
        });
      });

      context('as a payment method nonce authorized for one-time use', function () {
        it('successfully creates a transaction', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00'
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);

              done();
            });
          });
        });

        it('successfully creates a transaction with a payee id', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {
                payeeId: 'fake-payee-id'
              }
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.payeeId, 'fake-payee-id');

              done();
            });
          });
        });

        it('successfully creates a transaction with a payee id in the options params', function (done) {
          let paymentMethodParams = {
            paypalAccount: {
              consent_code: 'PAYPAL_CONSENT_CODE' // eslint-disable-line camelcase
            }
          };

          specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, null, function (nonce) {
            specHelper.defaultGateway.customer.create({}, function () {
              let transactionParams = {
                paymentMethodNonce: nonce,
                amount: '100.00',
                paypalAccount: {},
                options: {
                  payeeId: 'fake-payee-id'
                }
              };

              specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.equal(response.transaction.type, 'sale');
                assert.isNull(response.transaction.paypalAccount.token);
                assert.isString(response.transaction.paypalAccount.payerEmail);
                assert.isString(response.transaction.paypalAccount.authorizationId);
                assert.isString(response.transaction.paypalAccount.debugId);
                assert.equal(response.transaction.paypalAccount.payeeId, 'fake-payee-id');

                done();
              });
            });
          });
        });

        it('successfully creates a transaction with a payee id in transaction.options.paypal', function (done) {
          let paymentMethodParams = {
            paypalAccount: {
              consent_code: 'PAYPAL_CONSENT_CODE' // eslint-disable-line camelcase
            }
          };

          specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, null, function (nonce) {
            specHelper.defaultGateway.customer.create({}, function () {
              let transactionParams = {
                paymentMethodNonce: nonce,
                amount: '100.00',
                paypalAccount: {},
                options: {
                  paypal: {
                    payeeId: 'fake-payee-id'
                  }
                }
              };

              specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.equal(response.transaction.type, 'sale');
                assert.isNull(response.transaction.paypalAccount.token);
                assert.isString(response.transaction.paypalAccount.payerEmail);
                assert.isString(response.transaction.paypalAccount.authorizationId);
                assert.isString(response.transaction.paypalAccount.debugId);
                assert.equal(response.transaction.paypalAccount.payeeId, 'fake-payee-id');

                done();
              });
            });
          });
        });

        it('successfully creates a transaction with a payee email', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {
                payeeEmail: 'payee@example.com'
              }
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com');

              done();
            });
          });
        });

        it('successfully creates a transaction with a payee email in the options params', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                payeeEmail: 'payee@example.com'
              }
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com');

              done();
            });
          });
        });

        it('successfully creates a transaction with a payee email in transaction.options.paypal', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                paypal: {
                  payeeEmail: 'payee@example.com'
                }
              }
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com');

              done();
            });
          });
        });

        it('successfully creates a transaction with a PayPal custom field', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                paypal: {
                  customField: 'custom field junk'
                }
              }
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.customField, 'custom field junk');

              done();
            });
          });
        });

        it('successfully creates a transaction with PayPal supplementary data', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                paypal: {
                  supplementaryData: {
                    key1: 'value1',
                    key2: 'value2'
                  }
                }
              }
            };

            // note - supplementary data is not returned in response
            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              done();
            });
          });
        });

        it('successfully creates a transaction with a PayPal description', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                paypal: {
                  description: 'product description'
                }
              }
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.paypalAccount.description, 'product description');

              done();
            });
          });
        });

        it('does not vault even when explicitly asked', function (done) {
          let nonce = Nonces.PayPalOneTimePayment;

          specHelper.defaultGateway.customer.create({}, function () {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              options: {
                storeInVault: true
              }
            };

            specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);

              done();
            });
          });
        });
      });
    });

    it('allows submitting for settlement', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.status, 'submitted_for_settlement');

        done();
      });
    });

    it('allows storing in the vault', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          storeInVault: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.match(response.transaction.customer.id, /^\d+$/);
        assert.match(response.transaction.creditCard.token, /^\w+$/);

        done();
      });
    });

    it('can create transactions with custom fields', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        customFields: {
          storeMe: 'custom value'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.customFields.storeMe, 'custom value');

        done();
      });
    });

    it("allows specifying transactions as 'recurring'", function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        recurring: true
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.recurring, true);

        done();
      });
    });

    it("allows specifying transactions with transaction source as 'recurring_first'", function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        transactionSource: 'recurring_first'
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.recurring, true);

        done();
      });
    });

    it("allows specifying transactions with transaction source as 'recurring'", function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        transactionSource: 'recurring'
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.recurring, true);

        done();
      });
    });

    it("allows specifying transactions with transaction source as 'merchant'", function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        transactionSource: 'merchant'
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.recurring, false);

        done();
      });
    });

    it("allows specifying transactions with transaction source as 'moto'", function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        transactionSource: 'moto'
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.recurring, false);

        done();
      });
    });

    it('handles validation error when transaction source invalid', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        transactionSource: 'invalid_value'
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('transaction').on('transactionSource')[0].code,
          ValidationErrorCodes.Transaction.TransactionSourceIsInvalid
        );

        done();
      });
    });

    it('sets card type indicators on the transaction', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.Unknown,
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.equal(response.transaction.creditCard.prepaid, CreditCard.Prepaid.Unknown);
        assert.equal(response.transaction.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown);
        assert.equal(response.transaction.creditCard.commercial, CreditCard.Commercial.Unknown);
        assert.equal(response.transaction.creditCard.healthcare, CreditCard.Healthcare.Unknown);
        assert.equal(response.transaction.creditCard.debit, CreditCard.Debit.Unknown);
        assert.equal(response.transaction.creditCard.payroll, CreditCard.Payroll.Unknown);
        assert.equal(response.transaction.creditCard.countryOfIssuance, CreditCard.CountryOfIssuance.Unknown);
        assert.equal(response.transaction.creditCard.issuingBank, CreditCard.IssuingBank.Unknown);
        assert.equal(response.transaction.creditCard.productId, CreditCard.ProductId.Unknown);

        done();
      });
    });

    it('deserializes the retrieval reference number', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNotNull(response.transaction.retrievalReferenceNumber);

        done();
      });
    });

    it('handles processor soft declines', function (done) {
      let transactionParams = {
        amount: '2000.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(response.transaction.amount, '2000.00');
        assert.equal(response.transaction.status, 'processor_declined');
        assert.equal(response.transaction.processorResponseCode, '2000');
        assert.equal(response.transaction.processorResponseType, 'soft_declined');
        assert.equal(response.transaction.additionalProcessorResponse, '2000 : Do Not Honor');

        done();
      });
    });

    it('handles processor hard declines', function (done) {
      let transactionParams = {
        amount: '2015.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(response.transaction.amount, '2015.00');
        assert.equal(response.transaction.status, 'processor_declined');
        assert.equal(response.transaction.processorResponseCode, '2015');
        assert.equal(response.transaction.processorResponseType, 'hard_declined');
        assert.equal(response.transaction.additionalProcessorResponse, '2015 : Transaction Not Allowed');

        done();
      });
    });

    it('handles risk data returned by the gateway', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/16'
        },
        deviceData: 'abc123'
      };

      specHelper.fraudProtectionEnterpriseGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isTrue(response.success);
        assert.equal(response.transaction.riskData.decision, 'Approve');
        assert.isDefined(response.transaction.riskData.fraudServiceProvider);
        assert.isDefined(response.transaction.riskData.id);
        assert.isDefined(response.transaction.riskData.decisionReasons);
        assert.isDefined(response.transaction.riskData.transactionRiskScore);
        done();
      });
    });

    it('handles fraud rejection', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.Fraud,
          expirationDate: '05/16'
        }
      };

      specHelper.advancedFraudKountGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(response.transaction.status, Transaction.Status.GatewayRejected);
        assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.Fraud);
        done();
      });
    });

    it('handles risk_threshold rejection (test credit card number)', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.RiskThresholds,
          expirationDate: '05/16'
        }
      };

      specHelper.advancedFraudKountGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(response.transaction.status, Transaction.Status.GatewayRejected);
        assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.RiskThreshold);
        done();
      });
    });

    it('handles risk_threshold rejection (test nonce)', function (done) {
      let transactionParams = {
        amount: '10.0',
        paymentMethodNonce: Nonces.GatewayRejectedRiskThresholds
      };

      specHelper.advancedFraudKountGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(response.transaction.status, Transaction.Status.GatewayRejected);
        assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.RiskThreshold);
        done();
      });
    });

    it('allows fraud params', function (done) {
      let transactionParams = {
        amount: '10.0',
        deviceData: 'deviceData123',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        done();
      });
    });

    it('allows deprecated fraud params', function (done) {
      let transactionParams = {
        amount: '10.0',
        deviceSessionId: '123456789',
        fraudMerchantId: '0000000031',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        done();
      });
    });

    it('allows risk data params', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        riskData: {
          customerBrowser: 'Edge',
          customerDeviceId: 'customer_device_id_012',
          customerIp: '127.0.0.0',
          customerLocationZip: '91244',
          customerTenure: 20
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        done();
      });
    });

    it('handles risk data validation errors', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        riskData: {
          customerBrowser: 'Edge' + '1'.repeat(400),
          customerDeviceId: 'customer_device_id_012' + '3'.repeat(300),
          customerIp: '127.0.0.0',
          customerLocationZip: '912$4',
          customerTenure: '20'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').for('riskData').on('customerDeviceId')[0].code,
          ValidationErrorCodes.RiskData.CustomerDeviceIdIsTooLong
        );
        assert.equal(
          response.errors.for('transaction').for('riskData').on('customerLocationZip')[0].code,
          ValidationErrorCodes.RiskData.CustomerLocationZipInvalidCharacters
        );
        done();
      });
    });

    it('handles validation errors', function (done) {
      let transactionParams = {
        creditCard: {
          number: '5105105105105100'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(response.message, 'Amount is required.\nExpiration date is required.');
        assert.equal(
          response.errors.for('transaction').on('amount')[0].code,
          '81502'
        );
        assert.equal(
          response.errors.for('transaction').on('amount')[0].attribute,
          'amount'
        );
        assert.equal(
          response.errors.for('transaction').for('creditCard').on('expirationDate')[0].code,
          '81709'
        );

        let errorCodes = Array.from(response.errors.deepErrors()).map((error) => error.code);

        assert.equal(errorCodes.length, 2);
        assert.include(errorCodes, '81502');
        assert.include(errorCodes, '81709');

        done();
      });
    });

    it('handles descriptors', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isTrue(response.success);
        assert.equal(response.transaction.descriptor.name, 'abc*def');
        assert.equal(response.transaction.descriptor.phone, '1234567890');
        assert.equal(response.transaction.descriptor.url, 'ebay.com');

        done();
      });
    });

    it('handles descriptor validations', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        descriptor: {
          name: 'abc',
          phone: '1234567',
          url: '12345678901234'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('name')[0].code,
          ValidationErrorCodes.Descriptor.NameFormatIsInvalid
        );
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('phone')[0].code,
          ValidationErrorCodes.Descriptor.PhoneFormatIsInvalid
        );
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('url')[0].code,
          ValidationErrorCodes.Descriptor.UrlFormatIsInvalid
        );
        done();
      });
    });

    it('handles lodging industry data', function (done) {
      let transactionParams = {
        amount: '1000.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        industry: {
          industryType: Transaction.IndustryData.Lodging,
          data: {
            folioNumber: 'aaa',
            checkInDate: '2014-07-07',
            checkOutDate: '2014-07-11',
            roomRate: '170.00',
            roomTax: '30.00',
            noShow: false,
            advancedDeposit: false,
            fireSafe: true,
            propertyPhone: '1112223345',
            additionalCharges: [
              {
                kind: Transaction.AdditionalCharge.Telephone,
                amount: '50.00'
              },
              {
                kind: Transaction.AdditionalCharge.Other,
                amount: '150.00'
              }
            ]
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isTrue(response.success);

        done();
      });
    });

    it('handles lodging industry data validations', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        industry: {
          industryType: Transaction.IndustryData.Lodging,
          data: {
            folioNumber: 'aaa',
            checkInDate: '2014-07-07',
            checkOutDate: '2014-06-06',
            roomRate: 'abcdef',
            additionalCharges: [
              {
                kind: 'unknown',
                amount: '20.00'
              }
            ]
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').for('industry').on('checkOutDate')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.Lodging.CheckOutDateMustFollowCheckInDate
        );
        assert.equal(
          response.errors.for('transaction').for('industry').on('roomRate')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.Lodging.RoomRateFormatIsInvalid
        );
        assert.equal(
          response.errors.for('transaction').for('industry').for('additionalCharges').for('index0').on('kind')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.AdditionalCharge.KindIsInvalid
        );

        done();
      });
    });

    it('handles travel cruise industry data', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        industry: {
          industryType: Transaction.IndustryData.TravelAndCruise,
          data: {
            travelPackage: 'flight',
            departureDate: '2014-07-07',
            lodgingCheckInDate: '2014-07-07',
            lodgingCheckOutDate: '2014-08-08',
            lodgingName: 'Disney'
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isTrue(response.success);

        done();
      });
    });

    it('handles travel cruise industry data validations', function (done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        industry: {
          industryType: Transaction.IndustryData.TravelAndCruise,
          data: {
            travelPackage: 'onfoot',
            departureDate: '2014-07-07',
            lodgingCheckInDate: '2014-07-07',
            lodgingCheckOutDate: '2014-08-08',
            lodgingName: 'Disney'
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').for('industry').on('travelPackage')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.TravelCruise.TravelPackageIsInvalid
        );

        done();
      });
    });

    it('successfully creates a transaction with travel flight industry data', function (done) {
      let transactionParams = {
        amount: '10.0',
        paymentMethodNonce: Nonces.PayPalOneTimePayment,
        options: {
          submitForSettlement: true
        },
        industry: {
          industryType: Transaction.IndustryData.TravelAndFlight,
          data: {
            passengerFirstName: 'John',
            passengerLastName: 'Doe',
            passengerMiddleInitial: 'M',
            passengerTitle: 'Mr.',
            issuedDate: '2018-01-01',
            travelAgencyName: 'Expedia',
            travelAgencyCode: '12345678',
            ticketNumber: 'ticket-number',
            issuingCarrierCode: 'AA',
            customerCode: 'customer-code',
            fareAmount: '70.00',
            feeAmount: '10.00',
            taxAmount: '20.00',
            restrictedTicket: false,
            legs: [
              {
                conjunctionTicket: 'CJ0001',
                exchangeTicket: 'ET0001',
                couponNumber: '1',
                serviceClass: 'Y',
                carrierCode: 'AA',
                fareBasisCode: 'W',
                flightNumber: 'AA100',
                departureDate: '2018-01-02',
                departureAirportCode: 'MDW',
                departureTime: '08:00',
                arrivalAirportCode: 'ATX',
                arrivalTime: '10:00',
                stopoverPermitted: false,
                fareAmount: '35.00',
                feeAmount: '5.00',
                taxAmount: '10.00',
                endorsementOrRestrictions: 'NOT REFUNDABLE'
              },
              {
                conjunctionTicket: 'CJ0002',
                exchangeTicket: 'ET0002',
                couponNumber: '1',
                serviceClass: 'Y',
                carrierCode: 'AA',
                fareBasisCode: 'W',
                flightNumber: 'AA200',
                departureDate: '2018-01-03',
                departureAirportCode: 'ATX',
                departureTime: '12:00',
                arrivalAirportCode: 'MDW',
                arrivalTime: '14:00',
                stopoverPermitted: false,
                fareAmount: '35.00',
                feeAmount: '5.00',
                taxAmount: '10.00',
                endorsementOrRestrictions: 'NOT REFUNDABLE'
              }
            ]
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isTrue(response.success);

        done();
      });
    });

    it('fails with a validation error when travel flight industry data is invalid', function (done) {
      let transactionParams = {
        amount: '10.0',
        paymentMethodNonce: Nonces.PayPalOneTimePayment,
        options: {
          submitForSettlement: true
        },
        industry: {
          industryType: Transaction.IndustryData.TravelAndFlight,
          data: {
            fareAmount: '-1.23',
            legs: [
              {
                fareAmount: '-1.23'
              }
            ]
          }
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(
          response.errors.for('transaction').for('industry').on('fareAmount')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.TravelFlight.FareAmountCannotBeNegative
        );
        assert.equal(
          response.errors.for('transaction').for('industry').for('legs').for('index0').on('fareAmount')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.Leg.TravelFlight.FareAmountCannotBeNegative
        );

        done();
      });
    });

    context('with a service fee', function () {
      it('persists the service fee', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          },
          serviceFeeAmount: '1.00'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.serviceFeeAmount, '1.00');

          done();
        });
      });

      it('handles validation errors on service fees', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '1.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          },
          serviceFeeAmount: '5.00'
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('serviceFeeAmount')[0].code,
            ValidationErrorCodes.Transaction.ServiceFeeAmountIsTooLarge
          );

          done();
        });
      });

      it('sub merchant accounts must provide a service fee', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '1.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('merchantAccountId')[0].code,
            ValidationErrorCodes.Transaction.SubMerchantAccountRequiresServiceFeeAmount
          );

          done();
        });
      });
    });

    context('with escrow status', function () {
      it('can specify transactions to be held for escrow', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/12'
          },
          options: {
            holdInEscrow: true
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(
            response.transaction.escrowStatus,
            Transaction.EscrowStatus.HoldPending
          );
          done();
        });
      });

      it('can not be held for escrow if not a submerchant', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.defaultMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/12'
          },
          options: {
            holdInEscrow: true
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('base')[0].code,
            ValidationErrorCodes.Transaction.CannotHoldInEscrow
          );
          done();
        });
      });
    });

    context('releaseFromEscrow', function () {
      it('can release an escrowed transaction', done =>
        specHelper.createEscrowedTransaction(transaction =>
          specHelper.defaultGateway.transaction.releaseFromEscrow(transaction.id, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.escrowStatus, Transaction.EscrowStatus.ReleasePending);
            done();
          })
        )
      );

      it('cannot submit a non-escrowed transaction for release', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/12'
          },
          options: {
            holdInEscrow: true
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
          specHelper.defaultGateway.transaction.releaseFromEscrow(response.transaction.id, function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success, 'response had no errors');
            assert.equal(
              response.errors.for('transaction').on('base')[0].code,
              ValidationErrorCodes.Transaction.CannotReleaseFromEscrow
            );
            done();
          })
        );
      });
    });

    context('cancelRelease', function () {
      it('can cancel release for a transaction that has been submitted for release', done =>
        specHelper.createEscrowedTransaction(transaction =>
          specHelper.defaultGateway.transaction.releaseFromEscrow(transaction.id, () =>
            specHelper.defaultGateway.transaction.cancelRelease(transaction.id, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(
                response.transaction.escrowStatus,
                Transaction.EscrowStatus.Held
              );
              done();
            })
          )
        )
      );

      it('cannot cancel release a transaction that has not been submitted for release', done =>
        specHelper.createEscrowedTransaction(transaction =>
          specHelper.defaultGateway.transaction.cancelRelease(transaction.id, function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success, 'response had no errors');
            assert.equal(
              response.errors.for('transaction').on('base')[0].code,
              ValidationErrorCodes.Transaction.CannotCancelRelease
            );
            done();
          })
        )
      );
    });

    context('holdInEscrow', function () {
      it('can hold authorized or submitted for settlement transactions for escrow', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/12'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
          specHelper.defaultGateway.transaction.holdInEscrow(response.transaction.id, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(
              response.transaction.escrowStatus,
              Transaction.EscrowStatus.HoldPending
            );
            done();
          })
        );
      });

      it('cannot hold settled transactions for escrow', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/12'
          },
          options: {
            submitForSettlement: true
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
          specHelper.defaultGateway.testing.settle(response.transaction.id, (err, response) =>
            specHelper.defaultGateway.transaction.holdInEscrow(response.transaction.id, function (err, response) {
              assert.isFalse(response.success, 'response had no errors');
              assert.equal(
                response.errors.for('transaction').on('base')[0].code,
                ValidationErrorCodes.Transaction.CannotHoldInEscrow
              );
              done();
            })
          )
        );
      });
    });

    it('can use venmo sdk payment method codes', function (done) {
      let transactionParams = {
        amount: '1.00',
        venmoSdkPaymentMethodCode: VenmoSdk.VisaPaymentMethodCode
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.creditCard.bin, '411111');

        done();
      });
    });

    it('can use venmo sdk session', function (done) {
      let transactionParams = {
        amount: '1.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        options: {
          venmoSdkSession: VenmoSdk.Session
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.isFalse(response.transaction.creditCard.venmoSdk);

        done();
      });
    });

    it('can use vaulted credit card nonce', function (done) {
      let customerParams = {
        firstName: 'Adam',
        lastName: 'Jones'
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let customerId = response.customer.id;
        let paymentMethodParams = {
          creditCard: {
            number: '4111111111111111',
            expirationMonth: '12',
            expirationYear: '2099'
          }
        };

        specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, customerId, function (nonce) {
          let transactionParams = {
            amount: '1.00',
            paymentMethodNonce: nonce
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            done();
          });
        });
      });
    });

    it('can use vaulted PayPal account nonce', function (done) {
      let customerParams = {
        firstName: 'Adam',
        lastName: 'Jones'
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let customerId = response.customer.id;
        let paymentMethodParams = {
          paypalAccount: {
            consent_code: 'PAYPAL_CONSENT_CODE' // eslint-disable-line camelcase
          }
        };

        specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, customerId, function (nonce) {
          let transactionParams = {
            amount: '1.00',
            paymentMethodNonce: nonce
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            done();
          });
        });
      });
    });

    it('can use params nonce', function (done) {
      let paymentMethodParams = {
        creditCard: {
          number: '4111111111111111',
          expirationMonth: '12',
          expirationYear: '2099'
        }
      };

      specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, null, function (nonce) {
        let transactionParams = {
          amount: '1.00',
          paymentMethodNonce: nonce
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          done();
        });
      });
    });

    it('works with an unknown payment instrument', function (done) {
      let transactionParams = {
        amount: '1.00',
        paymentMethodNonce: Nonces.AbstractTransactable
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        done();
      });
    });

    context('amex rewards', function () {
      it('succeeds', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: '10.00',
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.Success,
            expirationDate: '12/2020'
          },
          options: {
            submitForSettlement: true,
            amexRewards: {
              requestId: 'ABC123',
              points: '1000',
              currencyAmount: '10.00',
              currencyIsoCode: 'USD'
            }
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement);

          done();
        });
      });

      it('succeeds even if the card is ineligible', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: '10.00',
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.IneligibleCard,
            expirationDate: '12/2020'
          },
          options: {
            submitForSettlement: true,
            amexRewards: {
              requestId: 'ABC123',
              points: '1000',
              currencyAmount: '10.00',
              currencyIsoCode: 'USD'
            }
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement);

          done();
        });
      });

      it("succeeds even if the card's balance is insufficient", function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: '10.00',
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.InsufficientPoints,
            expirationDate: '12/2020'
          },
          options: {
            submitForSettlement: true,
            amexRewards: {
              requestId: 'ABC123',
              points: '1000',
              currencyAmount: '10.00',
              currencyIsoCode: 'USD'
            }
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement);

          done();
        });
      });
    });

    context('Subscription', function () {
      it('charges a past due subscription', function (done) {
        let customerId, creditCardToken;
        let customerParams = {
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        };

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          customerId = response.customer.id;
          creditCardToken = response.customer.creditCards[0].token;

          let subscriptionId;
          let subscriptionParams = {
            paymentMethodToken: creditCardToken,
            planId: specHelper.plans.trialless.id
          };

          specHelper.defaultGateway.subscription.create(subscriptionParams, function (err, response) {
            subscriptionId = response.subscription.id;
            specHelper.makePastDue(response.subscription, function () {
              let transactionParams = {
                amount: '5.00',
                paymentMethodToken: creditCardToken,
                customerId: customerId,
                subscriptionId: subscriptionId
              };

              specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.equal(response.transaction.type, 'sale');
                assert.equal(response.transaction.amount, '5.00');
                assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
                assert.isNull(response.transaction.voiceReferralNumber);
                assert.equal(response.transaction.processorResponseCode, '1000');
                assert.equal(response.transaction.processorResponseType, 'approved');
                assert.exists(response.transaction.authorizationExpiresAt);

                done();
              });
            });
          });
        });
      });

      it('validates merchant account uses with subscription', function (done) {
        let customerId, creditCardToken;
        let customerParams = {
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        };

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          customerId = response.customer.id;
          creditCardToken = response.customer.creditCards[0].token;

          let subscriptionId;
          let subscriptionParams = {
            paymentMethodToken: creditCardToken,
            planId: specHelper.plans.trialless.id
          };

          specHelper.defaultGateway.subscription.create(subscriptionParams, function (err, response) {
            subscriptionId = response.subscription.id;
            specHelper.makePastDue(response.subscription, function () {
              let transactionParams = {
                amount: '5.00',
                paymentMethodToken: creditCardToken,
                customerId: customerId,
                subscriptionId: subscriptionId,
                merchantAccountId: '14LaddersWellsAuthRedundancy'
              };

              specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
                assert.isFalse(response.success);
                assert.equal(
                  response.errors.for('transaction').on('base')[0].code,
                  ValidationErrorCodes.Transaction.MerchantAccountIdDoesNotMatchSubscription
                );

                done();
              });
            });
          });
        });
      });
    });
  });

  describe('credit', function () {
    it('creates a credit', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.credit(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'credit');
        assert.equal(response.transaction.amount, '5.00');
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');

        done();
      });
    });

    it('handles validation errors', function (done) {
      let transactionParams = {
        creditCard: {
          number: '5105105105105100'
        }
      };

      specHelper.defaultGateway.transaction.credit(transactionParams, function (err, response) {
        assert.isFalse(response.success, 'response had no errors');
        assert.equal(response.message, 'Amount is required.\nExpiration date is required.');
        assert.equal(
          response.errors.for('transaction').on('amount')[0].code,
          '81502'
        );
        assert.equal(
          response.errors.for('transaction').on('amount')[0].attribute,
          'amount'
        );
        assert.equal(
          response.errors.for('transaction').for('creditCard').on('expirationDate')[0].code,
          '81709'
        );
        let errorCodes = Array.from(response.errors.deepErrors()).map((error) => error.code);

        assert.equal(errorCodes.length, 2);
        assert.include(errorCodes, '81502');
        assert.include(errorCodes, '81709');

        done();
      });
    });

    context('three d secure', function () {
      it('creates a transaction with threeDSecureToken', function (done) {
        let threeDVerificationParams = {
          number: '4111111111111111',
          expirationMonth: '05',
          expirationYear: '2009'
        };

        specHelper.create3DSVerification(specHelper.threeDSecureMerchantAccountId, threeDVerificationParams, function (threeDSecureToken) {
          let transactionParams = {
            merchantAccountId: specHelper.threeDSecureMerchantAccountId,
            amount: '5.00',
            creditCard: {
              number: '4111111111111111',
              expirationDate: '05/2009'
            },
            threeDSecureToken
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            done();
          });
        });
      });

      it('returns an error if sent null threeDSecureToken', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/2009'
          },
          threeDSecureToken: null
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('threeDSecureToken')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureTokenIsInvalid
          );

          done();
        });
      });

      it("returns an error if 3ds lookup data doesn't match txn data", function (done) {
        let threeDVerificationParams = {
          number: '4111111111111111',
          expirationMonth: '05',
          expirationYear: '2009'
        };

        specHelper.create3DSVerification(specHelper.threeDSecureMerchantAccountId, threeDVerificationParams, function (threeDSecureToken) {
          let transactionParams = {
            merchantAccountId: specHelper.threeDSecureMerchantAccountId,
            amount: '5.00',
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/2009'
            },
            threeDSecureToken
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isFalse(response.success, 'response had no errors');
            assert.equal(
              response.errors.for('transaction').on('threeDSecureToken')[0].code,
              ValidationErrorCodes.Transaction.ThreeDSecureTransactionDataDoesntMatchVerify
            );

            done();
          });
        });
      });

      it('gateway rejects if 3ds is specified as required but not supplied', function (done) {
        let nonceParams = {
          creditCard: {
            number: '4111111111111111',
            expirationMonth: '05',
            expirationYear: '2009'
          }
        };

        specHelper.generateNonceForNewPaymentMethod(nonceParams, null, function (nonce) {
          let transactionParams = {
            merchantAccountId: specHelper.threeDSecureMerchantAccountId,
            amount: '5.00',
            paymentMethodNonce: nonce,
            options: {
              threeDSecure: {
                required: true
              }
            }
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isFalse(response.success, 'response had no errors');
            assert.equal(response.transaction.status, Transaction.Status.GatewayRejected);
            assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.ThreeDSecure);

            done();
          });
        });
      });

      it('works for transaction with threeDSecurePassThru', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: '02',
            cavv: 'some_cavv',
            xid: 'some_xid',
            threeDSecureVersion: '1.0.2',
            authenticationResponse: 'Y',
            directoryResponse: 'Y',
            cavvAlgorithm: '2',
            dsTransactionId: 'some_ds_transaction_id'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Authorized);

          done();
        });
      });

      it('returns an error for transaction with threeDSecurePassThru when the merchant account does not support that card type', function (done) {
        let transactionParams = {
          merchantAccountId: 'heartland_ma',
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: '02',
            cavv: 'some_cavv',
            xid: 'some_xid'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('merchantAccountId')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureMerchantAccountDoesNotSupportCardType
          );

          done();
        });
      });

      it('returns an error for transaction when the threeDSecurePassThru eciFlag is missing', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: '',
            cavv: 'some_cavv',
            xid: 'some_xid'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on('eciFlag')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureEciFlagIsRequired
          );

          done();
        });
      });

      it('returns an error for transaction when the threeDSecurePassThru cavv or xid is missing', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: '06',
            cavv: '',
            xid: ''
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on('cavv')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureCavvIsRequired
          );

          done();
        });
      });

      it('returns an error for transaction when the threeDSecurePassThru eciFlag is invalid', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: 'bad_eci_flag',
            cavv: 'some_cavv',
            xid: 'some_xid'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on('eciFlag')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureEciFlagIsInvalid
          );

          done();
        });
      });

      it('returns an error for transaction when the threeDSecurePassThru three_d_secure_version is invalid', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: '06',
            cavv: 'some_cavv',
            xid: 'some_xid',
            threeDSecureVersion: 'invalid'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on('threeDSecureVersion')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureThreeDSecureVersionIsInvalid
          );

          done();
        });
      });

      it('returns an error for transaction when the threeDSecurePassThru authentication_response is invalid', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.adyenMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: '06',
            cavv: 'some_cavv',
            xid: 'some_xid',
            authenticationResponse: 'invalid'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.isNotEmpty(response.errors.for('transaction').for('threeDSecurePassThru').on('authenticationResponse'), 'Response should contain error on authenticationResponse');
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on('authenticationResponse')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureAuthenticationResponseIsInvalid
          );

          done();
        });
      });

      it('returns an error for transaction when the threeDSecurePassThru directory_response is invalid', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.adyenMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: '06',
            cavv: 'some_cavv',
            xid: 'some_xid',
            directoryResponse: 'invalid'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.isNotEmpty(response.errors.for('transaction').for('threeDSecurePassThru').on('directoryResponse'), 'Response should contain error on directoryResponse');
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on('directoryResponse')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureDirectoryResponseIsInvalid
          );

          done();
        });
      });

      it('returns an error for transaction when the threeDSecurePassThru cavv_algorithm is invalid', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.adyenMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: '06',
            cavv: 'some_cavv',
            xid: 'some_xid',
            cavvAlgorithm: 'invalid'
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.isNotEmpty(response.errors.for('transaction').for('threeDSecurePassThru').on('cavvAlgorithm'), 'Response should contain error on cavvAlgorithm');
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on('cavvAlgorithm')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureCavvAlgorithmIsInvalid
          );

          done();
        });
      });
    });
  });

  describe('find', function () {
    it('finds a transaction', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.find(response.transaction.id, function (err, transaction) {
          assert.equal(transaction.amount, '5.00');
          assert.isDefined(transaction.graphQLId);

          done();
        })
      );
    });

    it('exposes disbursementDetails', function (done) {
      let transactionId = 'deposittransaction';

      specHelper.defaultGateway.transaction.find(transactionId, function (err, transaction) {
        assert.equal(transaction.isDisbursed(), true);

        let disbursementDetails = transaction.disbursementDetails;

        assert.equal(disbursementDetails.settlementAmount, '100.00');
        assert.equal(disbursementDetails.settlementCurrencyIsoCode, 'USD');
        assert.equal(disbursementDetails.settlementCurrencyExchangeRate, '1');
        assert.equal(disbursementDetails.disbursementDate, '2013-04-10');
        assert.equal(disbursementDetails.success, true);
        assert.equal(disbursementDetails.fundsHeld, false);

        done();
      });
    });

    it('exposes the acquirerReferenceNumber', function (done) {
      let transactionId = 'transactionwithacquirerreferencenumber';

      specHelper.defaultGateway.transaction.find(transactionId, function (err, transaction) {
        assert.equal(transaction.acquirerReferenceNumber, '123456789 091019');
        done();
      });
    });

    it('exposes authorizationAdjustments', function (done) {
      let transactionId = 'authadjustmenttransaction';

      specHelper.defaultGateway.transaction.find(transactionId, function (err, transaction) {
        let authorizationAdjustment = transaction.authorizationAdjustments[0];

        assert.equal(authorizationAdjustment.amount, '-20.00');
        assert.equal(authorizationAdjustment.success, true);
        assert.exists(authorizationAdjustment.timestamp);
        assert.equal(authorizationAdjustment.processorResponseCode, '1000');
        assert.equal(authorizationAdjustment.processorResponseText, 'Approved');
        assert.equal(authorizationAdjustment.processorResponseType, 'approved');

        done();
      });
    });

    it('exposes authorizationAdjustments soft declined', function (done) {
      let transactionId = 'authadjustmenttransactionsoftdeclined';

      specHelper.defaultGateway.transaction.find(transactionId, function (err, transaction) {
        let authorizationAdjustment = transaction.authorizationAdjustments[0];

        assert.equal(authorizationAdjustment.amount, '-20.00');
        assert.equal(authorizationAdjustment.success, false);
        assert.exists(authorizationAdjustment.timestamp);
        assert.equal(authorizationAdjustment.processorResponseCode, '3000');
        assert.equal(authorizationAdjustment.processorResponseText, 'Processor Network Unavailable - Try Again');
        assert.equal(authorizationAdjustment.processorResponseType, 'soft_declined');

        done();
      });
    });

    it('exposes authorizationAdjustments hard declined', function (done) {
      let transactionId = 'authadjustmenttransactionharddeclined';

      specHelper.defaultGateway.transaction.find(transactionId, function (err, transaction) {
        let authorizationAdjustment = transaction.authorizationAdjustments[0];

        assert.equal(authorizationAdjustment.amount, '-20.00');
        assert.equal(authorizationAdjustment.success, false);
        assert.exists(authorizationAdjustment.timestamp);
        assert.equal(authorizationAdjustment.processorResponseCode, '2015');
        assert.equal(authorizationAdjustment.processorResponseText, 'Transaction Not Allowed');
        assert.equal(authorizationAdjustment.processorResponseType, 'hard_declined');

        done();
      });
    });

    it('exposes disputes', function (done) {
      let transactionId = 'disputedtransaction';

      specHelper.defaultGateway.transaction.find(transactionId, function (err, transaction) {
        let dispute = transaction.disputes[0];

        assert.equal(dispute.amount, '250.00');
        assert.equal(dispute.currencyIsoCode, 'USD');
        assert.equal(dispute.status, Dispute.Status.Won);
        assert.equal(dispute.receivedDate, '2014-03-01');
        assert.equal(dispute.replyByDate, '2014-03-21');
        assert.equal(dispute.reason, Dispute.Reason.Fraud);
        assert.equal(dispute.transactionDetails.id, transactionId);
        assert.equal(dispute.transactionDetails.amount, '1000.00');
        assert.equal(dispute.kind, Dispute.Kind.Chargeback);
        assert.equal(dispute.dateOpened, '2014-03-01');
        assert.equal(dispute.dateWon, '2014-03-07');

        done();
      });
    });

    it('exposes retrievals', function (done) {
      let transactionId = 'retrievaltransaction';

      specHelper.defaultGateway.transaction.find(transactionId, function (err, transaction) {
        let dispute = transaction.disputes[0];

        assert.equal(dispute.amount, '1000.00');
        assert.equal(dispute.currencyIsoCode, 'USD');
        assert.equal(dispute.status, Dispute.Status.Open);
        assert.equal(dispute.reason, Dispute.Reason.Retrieval);
        assert.equal(dispute.transactionDetails.id, transactionId);
        assert.equal(dispute.transactionDetails.amount, '1000.00');

        done();
      });
    });

    it('returns a not found error if given a bad id', done =>
      specHelper.defaultGateway.transaction.find('nonexistent_transaction', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('handles whitespace ids', done =>
      specHelper.defaultGateway.transaction.find(' ', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('returns all the required paypal fields', done =>
      specHelper.defaultGateway.transaction.find('settledtransaction', function (err, transaction) {
        assert.isString(transaction.paypalAccount.debugId);
        assert.isString(transaction.paypalAccount.payerEmail);
        assert.isString(transaction.paypalAccount.authorizationId);
        assert.isString(transaction.paypalAccount.payerId);
        assert.isString(transaction.paypalAccount.payerFirstName);
        assert.isString(transaction.paypalAccount.payerLastName);
        assert.isString(transaction.paypalAccount.payerStatus);
        assert.isString(transaction.paypalAccount.sellerProtectionStatus);
        assert.isString(transaction.paypalAccount.captureId);
        assert.isString(transaction.paypalAccount.refundId);
        assert.isString(transaction.paypalAccount.transactionFeeAmount);
        assert.isString(transaction.paypalAccount.transactionFeeCurrencyIsoCode);
        assert.isString(transaction.paypalAccount.refundFromTransactionFeeAmount);
        assert.isString(transaction.paypalAccount.refundFromTransactionFeeCurrencyIsoCode);
        done();
      })
    );

    context('threeDSecureInfo', function () {
      it("returns three_d_secure_info if it's present", done =>
        specHelper.defaultGateway.transaction.find('threedsecuredtransaction', function (err, transaction) {
          let info = transaction.threeDSecureInfo;

          assert.isTrue(info.liabilityShifted);
          assert.isTrue(info.liabilityShiftPossible);
          assert.equal(info.enrolled, 'Y');
          assert.equal(info.status, 'authenticate_successful');
          assert.equal(info.cavv, 'somebase64value');
          assert.equal(info.xid, 'xidvalue');
          assert.equal(info.eciFlag, '07');
          assert.equal(info.threeDSecureVersion, '1.0.2');
          assert.equal(info.dsTransactionId, 'dstxnid');
          done();
        })
      );

      it("returns null if it's empty", done =>
        specHelper.defaultGateway.transaction.find('settledtransaction', function (err, transaction) {
          assert.isNull(transaction.threeDSecureInfo);
          done();
        })
      );
    });
  });

  describe('refund', function () {
    it('refunds a transaction', done =>
      specHelper.createTransactionToRefund(transaction =>
        specHelper.defaultGateway.transaction.refund(transaction.id, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'credit');
          assert.equal(response.transaction.refundedTransactionId, transaction.id);

          done();
        })
      )
    );

    it('refunds a paypal transaction', done =>
      specHelper.createPayPalTransactionToRefund(transaction =>
        specHelper.defaultGateway.transaction.refund(transaction.id, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'credit');
          assert.equal(response.transaction.refundedTransactionId, transaction.id);

          done();
        })
      )
    );

    it('allows refunding partial amounts', done =>
      specHelper.createTransactionToRefund(transaction =>
        specHelper.defaultGateway.transaction.refund(transaction.id, '1.00', function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'credit');
          assert.equal(response.transaction.refundedTransactionId, transaction.id);
          assert.equal(response.transaction.amount, '1.00');

          done();
        })
      )
    );

    it('allows refunding with options param', done =>
      specHelper.createTransactionToRefund(function (transaction) {
        let options = {
          order_id: 'abcd', // eslint-disable-line camelcase
          amount: '1.00',
          merchant_account_id: specHelper.nonDefaultMerchantAccountId // eslint-disable-line camelcase
        };

        specHelper.defaultGateway.transaction.refund(transaction.id, options, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'credit');
          assert.equal(response.transaction.refundedTransactionId, transaction.id);
          assert.equal(response.transaction.orderId, 'abcd');
          assert.equal(response.transaction.amount, '1.00');
          assert.equal(response.transaction.merchantAccountId, specHelper.nonDefaultMerchantAccountId);

          done();
        });
      })
    );

    it('handles validation errors', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.refund(response.transaction.id, '5.00', function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91506');

          done();
        })
      );
    });

    it('handles refunds that soft decline', function (done) {
      let transactionParams = {
        amount: '9000.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, result) =>
        specHelper.defaultGateway.testing.settle(result.transaction.id, () =>
          specHelper.defaultGateway.transaction.refund(result.transaction.id, '2046.00', function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success, 'response had no errors');
            assert.equal(response.transaction.type, 'credit');
            assert.equal(response.transaction.status, 'processor_declined');
            assert.equal(response.transaction.processorResponseCode, '2046');
            assert.equal(response.transaction.processorResponseText, 'Declined');
            assert.equal(response.transaction.processorResponseType, 'soft_declined');
            assert.equal(response.transaction.additionalProcessorResponse, '2046 : Declined');

            done();
          })
        )
      );
    });

    it('handles refunds that hard decline', function (done) {
      let transactionParams = {
        amount: '9000.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, result) =>
        specHelper.defaultGateway.testing.settle(result.transaction.id, () =>
          specHelper.defaultGateway.transaction.refund(result.transaction.id, '2009.00', function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success, 'response had no errors');
            assert.equal(response.transaction.type, 'credit');
            assert.equal(response.transaction.status, 'processor_declined');
            assert.equal(response.transaction.processorResponseCode, '2009');
            assert.equal(response.transaction.processorResponseText, 'No Such Issuer');
            assert.equal(response.transaction.processorResponseType, 'hard_declined');
            assert.equal(response.transaction.additionalProcessorResponse, '2009 : No Such Issuer');
            done();
          })
        )
      );
    });
  });

  describe('submitForSettlement', function () {
    it('submits a transaction for settlement', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '5.00');

          done();
        })
      );
    });

    it('submits a paypal transaction for settlement', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let paymentMethodParams = {
          customerId: response.customer.id,
          paymentMethodNonce: Nonces.PayPalFuturePayment
        };

        specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
          let transactionParams = {
            amount: '5.00',
            paymentMethodToken: response.paymentMethod.token
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
            specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.status, 'settling');
              assert.equal(response.transaction.amount, '5.00');

              done();
            })
          );
        });
      })
    );

    it('allows submitting for a partial amount', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, '3.00', function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '3.00');

          done();
        })
      );
    });

    it('allows submitting with an order id', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, '3.00', {orderId: 'ABC123'}, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.orderId, 'ABC123');

          done();
        })
      );
    });

    it('allows submitting with an order id without specifying an amount', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, null, {orderId: 'ABC123'}, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.orderId, 'ABC123');
          assert.equal(response.transaction.amount, '5.00');

          done();
        })
      );
    });

    it('allows submitting with level 2 parameters', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) => {
        let submitForSettlementParams = {
          purchaseOrderNumber: 'ABC123',
          taxAmount: '1.34',
          taxExempt: true
        };

        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, null, submitForSettlementParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isTrue(response.transaction.taxExempt);
          assert.equal(response.transaction.purchaseOrderNumber, 'ABC123');
          assert.equal(response.transaction.status, 'submitted_for_settlement');

          done();
        });
      });
    });

    it('allows submitting with level 3 parameters', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) => {
        let submitForSettlementParams = {
          purchaseOrderNumber: 'ABC123',
          discountAmount: '1.34',
          shippingAmount: '2.11',
          shipsFromPostalCode: '90210',
          lineItems: [
            {
              quantity: '1.0232',
              name: 'Name #1',
              kind: 'debit',
              unitAmount: '45.1232',
              totalAmount: '45.15'
            }
          ]
        };

        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, null, submitForSettlementParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.shipsFromPostalCode, '90210');
          assert.equal(response.transaction.status, 'submitted_for_settlement');

          done();
        });
      });
    });

    it('allows submitting with a descriptor', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      let submitForSettlementParams = {
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, null, submitForSettlementParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.descriptor.name, 'abc*def');
          assert.equal(response.transaction.descriptor.phone, '1234567890');
          assert.equal(response.transaction.descriptor.url, 'ebay.com');

          done();
        })
      );
    });

    it('handles validation errors', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91507');

          done();
        })
      );
    });

    it('calls callback with an error when options object contains invalid keys', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, '5.00', {
          invalidKey: '1234'
        }, function (err) {
          assert.equal(err.type, 'invalidKeysError');
          assert.equal(err.message, 'These keys are invalid: invalidKey');

          done();
        })
      );
    });

    context('amex rewards', function () {
      it('succeeds', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: '10.00',
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.Success,
            expirationDate: '12/2020'
          },
          options: {
            amexRewards: {
              requestId: 'ABC123',
              points: '1000',
              currencyAmount: '10.00',
              currencyIsoCode: 'USD'
            }
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Authorized);

          specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function (err, response) {
            assert.isTrue(response.success);

            done();
          });
        });
      });

      it('succeeds even if the card is ineligible', function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: '10.00',
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.IneligibleCard,
            expirationDate: '12/2020'
          },
          options: {
            amexRewards: {
              requestId: 'ABC123',
              points: '1000',
              currencyAmount: '10.00',
              currencyIsoCode: 'USD'
            }
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Authorized);

          specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function (err, response) {
            assert.isTrue(response.success);

            done();
          });
        });
      });

      it("succeeds even if the card's balance is insufficient", function (done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: '10.00',
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.InsufficientPoints,
            expirationDate: '12/2020'
          },
          options: {
            amexRewards: {
              requestId: 'ABC123',
              points: '1000',
              currencyAmount: '10.00',
              currencyIsoCode: 'USD'
            }
          }
        };

        specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Authorized);

          specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function (err, response) {
            assert.isTrue(response.success);

            done();
          });
        });
      });
    });
  });

  describe('updateDetails', function () {
    it('updates the transaction details', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams = {
        amount: '4.00',
        orderId: '123',
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '4.00');
          assert.equal(response.transaction.orderId, '123');
          assert.equal(response.transaction.descriptor.name, 'abc*def');
          assert.equal(response.transaction.descriptor.phone, '1234567890');
          assert.equal(response.transaction.descriptor.url, 'ebay.com');

          done();
        })
      );
    });

    it('returns an authorizationError and logs when a key is invalid', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams = {
        amount: '4.00',
        invalidParam: 'something invalid'
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function (err) {
          assert.equal(err.type, 'invalidKeysError');
          assert.equal(err.message, 'These keys are invalid: invalidParam');

          done();
        })
      );
    });

    it('validates amount', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams =
        {amount: '555.00'};

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('amount')[0].code, '91522');

          done();
        })
      );
    });

    it('validates descriptor', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams = {
        amount: '4.00',
        orderId: '123',
        descriptor: {
          name: 'invalid name',
          phone: 'invalid phone',
          url: 'invalid url that is invalid because it is too long'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').for('descriptor').on('name')[0].code, '92201');
          assert.equal(response.errors.for('transaction').for('descriptor').on('phone')[0].code, '92202');
          assert.equal(response.errors.for('transaction').for('descriptor').on('url')[0].code, '92206');

          done();
        })
      );
    });

    it('validates orderId', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams =
        {orderId: new Array(257).join('X')};

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('orderId')[0].code, '91501');

          done();
        })
      );
    });

    it('validates processor', function (done) {
      let transactionParams = {
        merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
        amount: '10.00',
        creditCard: {
          number: CreditCardNumbers.AmexPayWithPoints.Success,
          expirationDate: '12/2020'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams = {
        amount: '4.00',
        orderId: '123',
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('base')[0].code, '915130');

          done();
        })
      );
    });

    it('validates status', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        }
      };

      let updateParams = {
        amount: '4.00',
        orderId: '123',
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('base')[0].code, '915129');

          done();
        })
      );
    });
  });

  describe('void', function () {
    it('voids a transaction', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.void(response.transaction.id, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'voided');

          done();
        })
      );
    });

    it('voids a paypal transaction', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let paymentMethodParams = {
          customerId: response.customer.id,
          paymentMethodNonce: Nonces.PayPalFuturePayment
        };

        specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
          let transactionParams = {
            amount: '5.00',
            paymentMethodToken: response.paymentMethod.token
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
            specHelper.defaultGateway.transaction.void(response.transaction.id, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.status, 'voided');

              done();
            })
          );
        });
      })
    );

    it('handles validation errors', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.void(response.transaction.id, (err, response) =>
          specHelper.defaultGateway.transaction.void(response.transaction.id, function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success, 'response had no errors');
            assert.equal(response.errors.for('transaction').on('base')[0].code, '91504');

            done();
          })
        )
      );
    });
  });

  describe('cloneTransaction', function () {
    it('clones a transaction', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        let cloneParams = {
          amount: '123.45',
          channel: 'MyShoppingCartProvider',
          options: {
            submitForSettlement: 'false'
          }
        };

        specHelper.defaultGateway.transaction.cloneTransaction(response.transaction.id, cloneParams, function (err, response) {
          assert.isTrue(response.success);
          let transaction = response.transaction;

          assert.equal(transaction.amount, '123.45');
          assert.equal(transaction.channel, 'MyShoppingCartProvider');
          assert.equal(transaction.creditCard.maskedNumber, '510510******5100');
          assert.equal(transaction.creditCard.expirationDate, '05/2012');

          done();
        });
      });
    });

    it('handles validation errors', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.credit(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.cloneTransaction(response.transaction.id, {amount: '123.45'}, function (err, response) {
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(
            response.errors.for('transaction').on('base')[0].code,
            '91543'
          );

          done();
        })
      );
    });

    it('can submit for settlement', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        let cloneParams = {
          amount: '123.45',
          channel: 'MyShoppingCartProvider',
          options: {
            submitForSettlement: 'true'
          }
        };

        specHelper.defaultGateway.transaction.cloneTransaction(response.transaction.id, cloneParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          done();
        });
      });
    });
  });

  describe('submitForPartialSettlement', function () {
    it('creates partial settlement transactions for an authorized transaction', function (done) {
      let transactionParams = {
        amount: '10.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        let authorizedTransaction = response.transaction;

        specHelper.defaultGateway.transaction.submitForPartialSettlement(authorizedTransaction.id, '6.00', function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '6.00');

          specHelper.defaultGateway.transaction.submitForPartialSettlement(authorizedTransaction.id, '4.00', function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.status, 'submitted_for_settlement');
            assert.equal(response.transaction.amount, '4.00');

            specHelper.defaultGateway.transaction.find(authorizedTransaction.id, function (err, transaction) {
              assert.isTrue(response.success);
              assert.equal(2, transaction.partialSettlementTransactionIds.length);
              done();
            });
          });
        });
      });
    });

    it('allows submitting with an order id', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForPartialSettlement(response.transaction.id, '3.00', {orderId: 'ABC123'}, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.orderId, 'ABC123');

          done();
        })
      );
    });

    it('allows submitting with a descriptor', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      let submitForPartialSettlementParams = {
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForPartialSettlement(response.transaction.id, '3.00', submitForPartialSettlementParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.descriptor.name, 'abc*def');
          assert.equal(response.transaction.descriptor.phone, '1234567890');
          assert.equal(response.transaction.descriptor.url, 'ebay.com');

          done();
        })
      );
    });

    it('handles validation errors', function (done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForPartialSettlement(response.transaction.id, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, 'response had no errors');
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91507');

          done();
        })
      );
    });

    it('cannot create a partial settlement transaction on a partial settlement transaction', function (done) {
      let transactionParams = {
        amount: '10.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        let authorizedTransaction = response.transaction;

        specHelper.defaultGateway.transaction.submitForPartialSettlement(authorizedTransaction.id, '6.00', function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '6.00');

          specHelper.defaultGateway.transaction.submitForPartialSettlement(response.transaction.id, '4.00', function (err, response) {
            assert.isFalse(response.success, 'response had no errors');
            let errorCode = response.errors.for('transaction').on('base')[0].code;

            assert.equal(errorCode, ValidationErrorCodes.Transaction.CannotSubmitForPartialSettlement);
            done();
          });
        });
      });
    });

    context('shared payment methods', function () {
      let address, creditCard, customer, grantingGateway, partnerMerchantGateway;

      before(function (done) {
        partnerMerchantGateway = new braintree.BraintreeGateway({
          merchantId: 'integration_merchant_public_id',
          publicKey: 'oauth_app_partner_user_public_key',
          privateKey: 'oauth_app_partner_user_private_key',
          environment: Environment.Development
        });

        let customerParams = {
          firstName: 'Joe',
          lastName: 'Brown',
          company: 'ExampleCo',
          email: 'joe@example.com',
          phone: '312.555.1234',
          fax: '614.555.5678',
          website: 'www.example.com'
        };

        return partnerMerchantGateway.customer.create(customerParams, function (err, response) {
          customer = response.customer;

          let creditCardParams = {
            customerId: customer.id,
            cardholderName: 'Adam Davis',
            number: '4111111111111111',
            expirationDate: '05/2009',
            billingAddress: {
              postalCode: '95131'
            }
          };

          let addressParams = {
            customerId: customer.id,
            firstName: 'Firsty',
            lastName: 'Lasty'
          };

          return partnerMerchantGateway.address.create(addressParams, function (err, response) {
            address = response.address;

            return partnerMerchantGateway.creditCard.create(creditCardParams, function (err, response) {
              creditCard = response.creditCard;

              let oauthGateway = new braintree.BraintreeGateway({
                clientId: 'client_id$development$integration_client_id',
                clientSecret: 'client_secret$development$integration_client_secret',
                environment: Environment.Development
              });

              let accessTokenParams = {
                merchantPublicId: 'integration_merchant_id',
                scope: 'grant_payment_method,shared_vault_transactions'
              };

              specHelper.createToken(oauthGateway, accessTokenParams, function (err, response) {
                grantingGateway = new braintree.BraintreeGateway({
                  accessToken: response.credentials.accessToken,
                  environment: Environment.Development
                });
                done();
              });
            });
          });
        });
      });

      it('returns facilitated on transactions created via nonce granting', done => {
        grantingGateway.paymentMethod.grant(creditCard.token, false, function (err, response) {
          let nonce = response.paymentMethodNonce.nonce;
          let transactionParams = {
            paymentMethodNonce: nonce,
            amount: Braintree.Test.TransactionAmounts.Authorize
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isTrue(response.success);
            assert.equal(response.transaction.facilitatedDetails.merchantId, 'integration_merchant_id');
            assert.equal(response.transaction.facilitatedDetails.merchantName, '14ladders');
            assert.equal(response.transaction.facilitatedDetails.paymentMethodNonce, nonce);
            assert.equal(response.transaction.facilitatorDetails.oauthApplicationClientId, 'client_id$development$integration_client_id');
            assert.equal(response.transaction.facilitatorDetails.oauthApplicationName, 'PseudoShop');
            assert.isNull(response.transaction.billing.postalCode);
            done();
          });
        });
      });

      it('returns billing postal code in transactions created via nonce granting when requested during grant API', done =>
        grantingGateway.paymentMethod.grant(creditCard.token, {
          allow_vaulting: false, // eslint-disable-line camelcase
          include_billing_postal_code: true // eslint-disable-line camelcase
        }, function (err, response) {
          let transactionParams = {
            paymentMethodNonce: response.paymentMethodNonce.nonce,
            amount: Braintree.Test.TransactionAmounts.Authorize
          };

          specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
            assert.isTrue(response.success);
            assert.equal(response.transaction.billing.postalCode, '95131');
            done();
          });
        })
      );

      it('allows transactions to be created with a shared payment method token, customer, billing and shipping addresses', function (done) {
        let transactionParams = {
          sharedPaymentMethodToken: creditCard.token,
          sharedCustomerId: customer.id,
          sharedShippingAddressId: address.id,
          sharedBillingAddressId: address.id,
          amount: Braintree.Test.TransactionAmounts.Authorize
        };

        grantingGateway.transaction.sale(transactionParams, function (err, response) {
          assert.isTrue(response.success);

          let facilitatedDetails = response.transaction.facilitatedDetails;
          let facilitatorDetails = response.transaction.facilitatorDetails;

          assert.equal(response.transaction.shipping.firstName, address.firstName);
          assert.equal(response.transaction.billing.firstName, address.firstName);
          assert.equal(facilitatedDetails.merchantId, 'integration_merchant_id');
          assert.equal(facilitatedDetails.merchantName, '14ladders');
          assert.isUndefined(facilitatedDetails.paymentMethodNonce);
          assert.equal(facilitatorDetails.oauthApplicationClientId, 'client_id$development$integration_client_id');
          assert.equal(facilitatorDetails.oauthApplicationName, 'PseudoShop');

          done();
        });
      });

      it('allows transactions to be created with a shared payment method nonce, customer, billing and shipping addresses', function (done) {
        partnerMerchantGateway.paymentMethodNonce.create(creditCard.token, function (err, result) {
          if (err) {
            done(err);

            return;
          }

          let transactionParams = {
            sharedPaymentMethodNonce: result.paymentMethodNonce.nonce,
            sharedCustomerId: customer.id,
            sharedShippingAddressId: address.id,
            sharedBillingAddressId: address.id,
            amount: Braintree.Test.TransactionAmounts.Authorize
          };

          grantingGateway.transaction.sale(transactionParams, function (err, response) {
            if (err) {
              done(err);

              return;
            }

            assert.isTrue(response.success);

            let facilitatedDetails = response.transaction.facilitatedDetails;
            let facilitatorDetails = response.transaction.facilitatorDetails;

            assert.equal(response.transaction.shipping.firstName, address.firstName);
            assert.equal(response.transaction.billing.firstName, address.firstName);
            assert.equal(facilitatedDetails.merchantId, 'integration_merchant_id');
            assert.equal(facilitatedDetails.merchantName, '14ladders');
            assert.isUndefined(facilitatedDetails.paymentMethodNonce);
            assert.equal(facilitatorDetails.oauthApplicationClientId, 'client_id$development$integration_client_id');
            assert.equal(facilitatorDetails.oauthApplicationName, 'PseudoShop');

            done();
          });
        });
      });
    });
  });

  describe('card on file network tokenization', function () {
    it('creates a network tokenized transaction with a vaulted credit card token', function (done) {
      let transactionParams = {
        amount: '5.00',
        paymentMethodToken: 'network_tokenized_credit_card'
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'sale');
        assert.equal(response.transaction.amount, '5.00');
        assert.equal(response.transaction.processorResponseCode, '1000');
        assert.equal(response.transaction.processorResponseType, 'approved');
        assert.isTrue(response.transaction.processedWithNetworkToken);

        done();
      });
    });

    it('creates a non-network tokenized transaction with a nonce', function (done) {
      let transactionParams = {
        amount: '5.00',
        paymentMethodNonce: Nonces.AbstractTransactable
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'sale');
        assert.equal(response.transaction.amount, '5.00');
        assert.equal(response.transaction.processorResponseCode, '1000');
        assert.equal(response.transaction.processorResponseType, 'approved');
        assert.isFalse(response.transaction.processedWithNetworkToken);

        done();
      });
    });
  });

  describe('installments for BRL transaction', function () {
    it('creates an authorization and recives installment_count', function (done) {
      let transactionParams = {
        merchantAccountId: 'card_processor_brl',
        amount: '100.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        installments: {
          count: 4
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.installmentCount, 4);

        done();
      });
    });

    it('submits for settlement and creates installments', done => {
      let transactionParams = {
        merchantAccountId: 'card_processor_brl',
        amount: '100.00',
        creditCard: {
          number: '4111111111111111',
          expirationDate: '05/12'
        },
        installments: {
          count: 4
        },
        options: {
          submitForSettlement: true
        }
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        let transaction = response.transaction;

        transaction.installments.forEach((element, index) => {
          assert.equal(element.id, `${transaction.id}_INST_${index + 1}`);
          assert.equal(element.amount, '25.00');
        });

        specHelper.defaultGateway.transaction.refund(transaction.id, '20.00', function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          let refundTransaction = response.transaction;

          refundTransaction.refundedInstallments.forEach(element => {
            assert.equal(element.adjustments[0].kind, 'REFUND');
            assert.equal(element.adjustments[0].amount, '-5.00');
          });
        });
        done();
      });
    });
  });
});
