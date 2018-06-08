'use strict';

let Nonces = require('../../../lib/braintree/test/nonces').Nonces;
let PaymentInstrumentTypes = require('../../../lib/braintree/payment_instrument_types').PaymentInstrumentTypes;

describe('Samsung Pay', function () {
  it('can create from nonce', done =>
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.SamsungPayVisa
      };

      specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        let samsungPayCard = response.paymentMethod;

        assert.equal(response.paymentMethod.constructor.name, 'SamsungPayCard');

        assert.isNotNull(samsungPayCard.bin);
        assert.isNotNull(samsungPayCard.cardType);
        assert.isNotNull(samsungPayCard.commercial);
        assert.isNotNull(samsungPayCard.countryOfIssuance);
        assert.isNotNull(samsungPayCard.createdAt);
        assert.isNotNull(samsungPayCard.customerId);
        assert.isNotNull(samsungPayCard.customerLocation);
        assert.isNotNull(samsungPayCard.debit);
        assert.isNotNull(samsungPayCard.default);
        assert.isNotNull(samsungPayCard.durbinRegulated);
        assert.isNotNull(samsungPayCard.expirationDate);
        assert.isNotNull(samsungPayCard.expirationMonth);
        assert.isNotNull(samsungPayCard.expirationYear);
        assert.isNotNull(samsungPayCard.expired);
        assert.isNotNull(samsungPayCard.healthcare);
        assert.isNotNull(samsungPayCard.imageUrl);
        assert.isNotNull(samsungPayCard.issuingBank);
        assert.isNotNull(samsungPayCard.last4);
        assert.isNotNull(samsungPayCard.maskedNumber);
        assert.isNotNull(samsungPayCard.payroll);
        assert.isNotNull(samsungPayCard.prepaid);
        assert.isNotNull(samsungPayCard.productId);
        assert.isNotNull(samsungPayCard.sourceCardLast4);
        assert.isNotNull(samsungPayCard.subscriptions);
        assert.isNotNull(samsungPayCard.token);
        assert.isNotNull(samsungPayCard.uniqueNumberIdentifier);
        assert.isNotNull(samsungPayCard.updatedAt);

        specHelper.defaultGateway.customer.find(customerId, function (err, customer) {
          assert.equal(customer.samsungPayCards.length, 1);
          assert.equal(customer.samsungPayCards[0].token, samsungPayCard.token);

          done();
        });
      });
    })
  );

  it('can create from nonce with name and address', done => {
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.SamsungPayVisa,
        cardholderName: 'Jenny Block',
        billingAddress: {
          streetAddress: '123 Fake St',
          locality: 'Chicago',
          region: 'IL'
        }
      };

      specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        let samsungPayCard = response.paymentMethod;

        assert.equal(samsungPayCard.cardholderName, 'Jenny Block');
        assert.equal(samsungPayCard.billingAddress.streetAddress, '123 Fake St');
        assert.equal(samsungPayCard.billingAddress.locality, 'Chicago');
        assert.equal(samsungPayCard.billingAddress.region, 'IL');
        assert.equal(samsungPayCard.billingAddress.postalCode, '60607');
        done();
      });
    });
  });

  it('can search for transaction', done => {
    let transactionParams = {
      paymentMethodNonce: Nonces.SamsungPayVisa,
      amount: '1.00'
    };

    specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) => {
      let transaction = response.transaction;

      let search = function (search) { // eslint-disable-line func-style
        search.id().is(transaction.id);
        search.paymentInstrumentType().is(PaymentInstrumentTypes.SamsungPayCard);

        return search;
      };

      specHelper.defaultGateway.transaction.search(search, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.length(), 1);

        return response.first(function (err, foundTransaction) {
          assert.isObject(foundTransaction);
          assert.isNull(err);
          assert.equal(foundTransaction.id, transaction.id);

          done();
        });
      });
    });
  });

  it('can create transaction from nonce and vault', done => {
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let transactionParams = {
        paymentMethodNonce: Nonces.SamsungPayVisa,
        customerId: customerId,
        amount: '1.00',
        options: {storeInVault: true}
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) => {
        assert.isNull(err);
        assert.isTrue(response.success);

        let samsungPayCardDetails = response.transaction.samsungPayCard;

        assert.equal(samsungPayCardDetails.constructor.name, 'SamsungPayCard');

        assert.isNotNull(samsungPayCardDetails.bin);
        assert.isNotNull(samsungPayCardDetails.cardType);
        assert.isNotNull(samsungPayCardDetails.commercial);
        assert.isNotNull(samsungPayCardDetails.countryOfIssuance);
        assert.isNotNull(samsungPayCardDetails.customerLocation);
        assert.isNotNull(samsungPayCardDetails.debit);
        assert.isNotNull(samsungPayCardDetails.durbinRegulated);
        assert.isNotNull(samsungPayCardDetails.expirationDate);
        assert.isNotNull(samsungPayCardDetails.expirationMonth);
        assert.isNotNull(samsungPayCardDetails.expirationYear);
        assert.isNotNull(samsungPayCardDetails.healthcare);
        assert.isNotNull(samsungPayCardDetails.imageUrl);
        assert.isNotNull(samsungPayCardDetails.issuingBank);
        assert.isNotNull(samsungPayCardDetails.last4);
        assert.isNotNull(samsungPayCardDetails.maskedNumber);
        assert.isNotNull(samsungPayCardDetails.payroll);
        assert.isNotNull(samsungPayCardDetails.prepaid);
        assert.isNotNull(samsungPayCardDetails.productId);
        assert.isNotNull(samsungPayCardDetails.token);

        done();
      });
    });
  });
});
