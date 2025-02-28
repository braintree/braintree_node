"use strict";

let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;
let PaymentInstrumentTypes =
  require("../../../lib/braintree/payment_instrument_types").PaymentInstrumentTypes;

describe("Visa Checkout", function () {
  it("can create from nonce", (done) =>
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.VisaCheckoutVisa,
      };

      specHelper.defaultGateway.paymentMethod.create(
        paymentMethodParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          let visaCheckoutCard = response.paymentMethod;

          assert.equal(
            response.paymentMethod.constructor.name,
            "VisaCheckoutCard"
          );

          assert.equal(visaCheckoutCard.callId, "abc123");
          assert.isNotNull(visaCheckoutCard.billingAddress);
          assert.isNotNull(visaCheckoutCard.bin);
          assert.isNotNull(visaCheckoutCard.cardType);
          assert.isNotNull(visaCheckoutCard.cardholderName);
          assert.isNotNull(visaCheckoutCard.commercial);
          assert.isNotNull(visaCheckoutCard.countryOfIssuance);
          assert.isNotNull(visaCheckoutCard.createdAt);
          assert.isNotNull(visaCheckoutCard.customerId);
          assert.isNotNull(visaCheckoutCard.customerLocation);
          assert.isNotNull(visaCheckoutCard.debit);
          assert.isNotNull(visaCheckoutCard.default);
          assert.isNotNull(visaCheckoutCard.durbinRegulated);
          assert.isNotNull(visaCheckoutCard.expirationDate);
          assert.isNotNull(visaCheckoutCard.expirationMonth);
          assert.isNotNull(visaCheckoutCard.expirationYear);
          assert.isNotNull(visaCheckoutCard.expired);
          assert.isNotNull(visaCheckoutCard.healthcare);
          assert.isNotNull(visaCheckoutCard.imageUrl);
          assert.isNotNull(visaCheckoutCard.issuingBank);
          assert.isNotNull(visaCheckoutCard.last4);
          assert.isNotNull(visaCheckoutCard.maskedNumber);
          assert.isNotNull(visaCheckoutCard.payroll);
          assert.isNotNull(visaCheckoutCard.prepaid);
          assert.isNotNull(visaCheckoutCard.prepaidReloadable);
          assert.isNotNull(visaCheckoutCard.productId);
          assert.isNotNull(visaCheckoutCard.subscriptions);
          assert.isNotNull(visaCheckoutCard.token);
          assert.isNotNull(visaCheckoutCard.uniqueNumberIdentifier);
          assert.isNotNull(visaCheckoutCard.updatedAt);

          specHelper.defaultGateway.customer.find(
            customerId,
            function (err, customer) {
              assert.equal(customer.visaCheckoutCards.length, 1);
              assert.equal(
                customer.visaCheckoutCards[0].token,
                visaCheckoutCard.token
              );

              done();
            }
          );
        }
      );
    }));

  it("can create with verification", (done) =>
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.VisaCheckoutVisa,
        options: { verifyCard: true },
      };

      specHelper.defaultGateway.paymentMethod.create(
        paymentMethodParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          done();
        }
      );
    }));

  it("can search for transaction", (done) => {
    let transactionParams = {
      paymentMethodNonce: Nonces.VisaCheckoutVisa,
      amount: "1.00",
    };

    specHelper.defaultGateway.transaction.sale(
      transactionParams,
      (err, response) => {
        let transaction = response.transaction;

        // eslint-disable-next-line func-style
        let search = function (search) {
          search.id().is(transaction.id);
          search
            .paymentInstrumentType()
            .is(PaymentInstrumentTypes.VisaCheckoutCard);

          return search;
        };

        specHelper.defaultGateway.transaction.search(
          search,
          function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.length(), 1);

            return response.first(function (err, foundTransaction) {
              assert.isObject(foundTransaction);
              assert.isNull(err);
              assert.equal(foundTransaction.id, transaction.id);

              done();
            });
          }
        );
      }
    );
  });

  it("can create transaction from nonce and vault", (done) => {
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let transactionParams = {
        paymentMethodNonce: Nonces.VisaCheckoutVisa,
        customerId: customerId,
        amount: "1.00",
        options: { storeInVault: true },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        (err, response) => {
          assert.isNull(err);
          assert.isTrue(response.success);

          let visaCheckoutCardDetails = response.transaction.visaCheckoutCard;

          assert.equal(
            visaCheckoutCardDetails.constructor.name,
            "VisaCheckoutCard"
          );

          assert.equal("abc123", visaCheckoutCardDetails.callId);
          assert.isNotNull(visaCheckoutCardDetails.bin);
          assert.isNotNull(visaCheckoutCardDetails.cardType);
          assert.isNotNull(visaCheckoutCardDetails.cardholderName);
          assert.isNotNull(visaCheckoutCardDetails.commercial);
          assert.isNotNull(visaCheckoutCardDetails.countryOfIssuance);
          assert.isNotNull(visaCheckoutCardDetails.customerLocation);
          assert.isNotNull(visaCheckoutCardDetails.debit);
          assert.isNotNull(visaCheckoutCardDetails.durbinRegulated);
          assert.isNotNull(visaCheckoutCardDetails.expirationDate);
          assert.isNotNull(visaCheckoutCardDetails.expirationMonth);
          assert.isNotNull(visaCheckoutCardDetails.expirationYear);
          assert.isNotNull(visaCheckoutCardDetails.healthcare);
          assert.isNotNull(visaCheckoutCardDetails.imageUrl);
          assert.isNotNull(visaCheckoutCardDetails.issuingBank);
          assert.isNotNull(visaCheckoutCardDetails.last4);
          assert.isNotNull(visaCheckoutCardDetails.maskedNumber);
          assert.isNotNull(visaCheckoutCardDetails.payroll);
          assert.isNotNull(visaCheckoutCardDetails.prepaid);
          assert.isNotNull(visaCheckoutCardDetails.prepaidReloadable);
          assert.isNotNull(visaCheckoutCardDetails.productId);
          assert.isNotNull(visaCheckoutCardDetails.token);

          done();
        }
      );
    });
  });
});
