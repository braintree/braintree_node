let Braintree = require("../../../lib/braintree");
require('../../spec_helper');
let { CreditCardNumbers } = require('../../../lib/braintree/test/credit_card_numbers');
let { CreditCard } = Braintree;
let { CreditCardVerification } = Braintree;

describe("CreditCardVerification", () =>
  describe("search", function() {
    it("can return empty results", done =>
      specHelper.defaultGateway.creditCardVerification.search(search => search.creditCardCardholderName().is(specHelper.randomId() + " Smith")
      , function(err, response) {
        assert.isNull(err);
        assert.equal(response.length(), 0);

        return done();
      })
    );

    it("handles responses with a single result", function(done) {
      let customerEmail = `sandworm${customerId}@example.com`;
      var customerId = specHelper.randomId();
      let expirationMonth = '12';
      let expirationYear = '2016';
      let expirationDate = expirationMonth + '/' + expirationYear;
      let name = specHelper.randomId() + ' Smith';
      let number = '4111111111111111';
      let paymentMethodToken = specHelper.randomId();
      let postalCode = '60647';

      let customerParams = {
        id: customerId,
        email: customerEmail,
        creditCard: {
          token: paymentMethodToken,
          cardholderName: name,
          number,
          expirationDate,
          billingAddress: {
            streetAddress: '123 Fake St',
            extendedAddress: 'Suite 403',
            locality: 'Chicago',
            region: 'IL',
            postalCode,
            countryName: 'United States of America'
          },
          options: {
            verifyCard: true
          }
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, (err, response) =>
        specHelper.defaultGateway.creditCardVerification.search(function(search) {
          search.billingAddressDetailsPostalCode().is(postalCode);
          search.creditCardCardType().is(CreditCard.CardType.Visa);
          search.creditCardCardholderName().is(name);
          search.creditCardExpirationDate().is(expirationDate);
          search.creditCardNumber().is(number);
          search.customerEmail().is(customerEmail);
          search.customerId().is(customerId);
          search.paymentMethodToken().is(paymentMethodToken);
          return search.status().is(CreditCardVerification.StatusType.Verified);
        }

        , function(err, response) {
          assert.equal(response.length(), 1);
          return response.first(function(err, verification) {
            let { createdAt } = verification;
            let verificationId = verification.id;

            assert.equal(verification.billing.postalCode, postalCode);
            assert.equal(verification.creditCard.bin, '411111');
            assert.equal(verification.creditCard.cardholderName, name);
            assert.equal(verification.creditCard.expirationMonth, expirationMonth);
            assert.equal(verification.creditCard.expirationYear, expirationYear);
            assert.equal(verification.creditCard.cardType, CreditCard.CardType.Visa);
            assert.equal(verification.status, CreditCardVerification.StatusType.Verified);

            return specHelper.defaultGateway.creditCardVerification.search(function(search) {
              search.createdAt().is(createdAt);
              search.id().is(verificationId);
              return search.ids().in(verificationId);
            }

            , function(err, response) {
              assert.equal(response.length(), 1);
              return response.first(function(err, verification) {
                assert.equal(verification.createdAt, createdAt);
                assert.equal(verification.id, verificationId);

                return done();
              });
            });
          });
        })
      );
    });

    it("allows stream style interation of results", function(done) {
      let name = specHelper.randomId() + ' Smith';
      let customerParams = {
        creditCard: {
          cardholderName: name,
          number: '4000111111111115',
          expirationDate: '12/2016',
          options: {
            verifyCard: true
          }
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let search = specHelper.defaultGateway.creditCardVerification.search(search => search.creditCardCardholderName().is(name));

        let verifications = [];

        search.on('data', verification => verifications.push(verification));

        search.on('end', function() {
          assert.equal(verifications[0].creditCard.bin, '400011');
          assert.equal(verifications[0].creditCard.cardholderName, name);

          return done();
        });

        return search.resume();
      });
    });

    it("can return multiple results", function(done) {
      let name = specHelper.randomId() + ' Smith';
      let creditCardNumber = CreditCardNumbers.CardTypeIndicators.Debit;
      let expirationDate = '12/2016';
      let email = "mike.a@example.com";
      let firstCustomerId = specHelper.randomId();
      let secondCustomerId = specHelper.randomId();

      let customerParams = {
        id: firstCustomerId,
        email,
        creditCard: {
          cardholderName: name,
          number: creditCardNumber,
          expirationDate,
          options: {
            verifyCard: true
          }
        }
      };

      let customerParams2 = {
        id: secondCustomerId,
        email,
        creditCard: {
          cardholderName: name,
          number: creditCardNumber,
          expirationDate,
          options: {
            verifyCard: true
          }
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, (err, response) =>
        specHelper.defaultGateway.customer.create(customerParams2, (err, response) =>
          specHelper.defaultGateway.creditCardVerification.search(function(search) {
            search.creditCardCardholderName().is(name);
            search.creditCardNumber().is(creditCardNumber);
            search.creditCardExpirationDate().is(expirationDate);
            search.creditCardCardType().in(CreditCard.CardType.Visa);
            return search.customerEmail().is(email);
          }
          , function(err, response) {
            let verifications = [];

            return response.each(function(err, verification) {
              verifications.push(verification);
              if (verifications.length === 2) {
                assert.isNull(err);
                assert.notEqual(verifications[0].id, verifications[1].id);
                assert.equal(verifications[0].creditCard.cardholderName, name);
                assert.equal(verifications[1].creditCard.cardholderName, name);

                return done();
              }
            });
          })
        )
      );
    });

    return it("returns card type indicators", function(done) {
      let name = specHelper.randomId() + ' Smith';
      return specHelper.defaultGateway.customer.create({
        creditCard: {
          cardholderName: name,
          number: CreditCardNumbers.CardTypeIndicators.Unknown,
          expirationDate: '05/12',
          options: {
            verifyCard: true
          }
        }
      }
      , (err, response) =>
        specHelper.defaultGateway.creditCardVerification.search(search => search.creditCardCardholderName().is(name)
        , (err, response) =>
          response.first(function(err, verification) {
            assert.isNull(err);
            assert.equal(verification.creditCard.cardholderName, name);
            assert.equal(verification.creditCard.prepaid, CreditCard.Prepaid.Unknown);
            assert.equal(verification.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown);
            assert.equal(verification.creditCard.commercial, CreditCard.Commercial.Unknown);
            assert.equal(verification.creditCard.healthcare, CreditCard.Healthcare.Unknown);
            assert.equal(verification.creditCard.debit, CreditCard.Debit.Unknown);
            assert.equal(verification.creditCard.payroll, CreditCard.Payroll.Unknown);
            assert.equal(verification.creditCard.countryOfIssuance, CreditCard.CountryOfIssuance.Unknown);
            assert.equal(verification.creditCard.issuingBank, CreditCard.IssuingBank.Unknown);
            assert.equal(verification.creditCard.productId, CreditCard.ProductId.Unknown);

            return done();
          })
        )
      );
    });
  })
);
