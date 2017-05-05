'use strict';

let Nonces = require('../../../lib/braintree/test/nonces').Nonces;
let PaymentInstrumentTypes = require('../../../lib/braintree/payment_instrument_types').PaymentInstrumentTypes;

describe('Masterpass', function () {
  it('can create from nonce', done =>
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.MasterpassAmEx
      };

      specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        let masterpassCard = response.paymentMethod;

        assert.equal(response.paymentMethod.constructor.name, 'MasterpassCard');

        assert.isNotNull(masterpassCard.billingAddress);
        assert.isNotNull(masterpassCard.bin);
        assert.isNotNull(masterpassCard.callId);
        assert.isNotNull(masterpassCard.cardType);
        assert.isNotNull(masterpassCard.cardholderName);
        assert.isNotNull(masterpassCard.commercial);
        assert.isNotNull(masterpassCard.countryOfIssuance);
        assert.isNotNull(masterpassCard.createdAt);
        assert.isNotNull(masterpassCard.customerId);
        assert.isNotNull(masterpassCard.customerLocation);
        assert.isNotNull(masterpassCard.debit);
        assert.isNotNull(masterpassCard.default);
        assert.isNotNull(masterpassCard.durbinRegulated);
        assert.isNotNull(masterpassCard.expirationDate);
        assert.isNotNull(masterpassCard.expirationMonth);
        assert.isNotNull(masterpassCard.expirationYear);
        assert.isNotNull(masterpassCard.expired);
        assert.isNotNull(masterpassCard.healthcare);
        assert.isNotNull(masterpassCard.imageUrl);
        assert.isNotNull(masterpassCard.issuingBank);
        assert.isNotNull(masterpassCard.last4);
        assert.isNotNull(masterpassCard.maskedNumber);
        assert.isNotNull(masterpassCard.payroll);
        assert.isNotNull(masterpassCard.prepaid);
        assert.isNotNull(masterpassCard.productId);
        assert.isNotNull(masterpassCard.subscriptions);
        assert.isNotNull(masterpassCard.token);
        assert.isNotNull(masterpassCard.uniqueNumberIdentifier);
        assert.isNotNull(masterpassCard.updatedAt);

        specHelper.defaultGateway.customer.find(customerId, function (err, customer) {
          assert.equal(customer.masterpassCards.length, 1);
          assert.equal(customer.masterpassCards[0].token, masterpassCard.token);

          done();
        });
      });
    })
  );

  it('can create with verification', done =>
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.MasterpassAmEx,
        options: {verifyCard: true}
      };

      specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        done();
      });
    })
  );

  it('can search for transaction', done => {
    let transactionParams = {
      paymentMethodNonce: Nonces.MasterpassAmEx,
      amount: '1.00'
    };

    specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) => {
      let transaction = response.transaction;

      let search = function (search) { // eslint-disable-line func-style
        search.id().is(transaction.id);
        search.paymentInstrumentType().is(PaymentInstrumentTypes.MasterpassCard);

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
        paymentMethodNonce: Nonces.MasterpassAmEx,
        customerId: customerId,
        amount: '1.00',
        options: {storeInVault: true}
      };

      specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) => {
        assert.isNull(err);
        assert.isTrue(response.success);

        let masterpassCardDetails = response.transaction.masterpassCard;

        assert.equal(masterpassCardDetails.constructor.name, 'MasterpassCard');

        assert.isNotNull(masterpassCardDetails.bin);
        assert.isNotNull(masterpassCardDetails.cardType);
        assert.isNotNull(masterpassCardDetails.cardholderName);
        assert.isNotNull(masterpassCardDetails.commercial);
        assert.isNotNull(masterpassCardDetails.countryOfIssuance);
        assert.isNotNull(masterpassCardDetails.customerLocation);
        assert.isNotNull(masterpassCardDetails.debit);
        assert.isNotNull(masterpassCardDetails.durbinRegulated);
        assert.isNotNull(masterpassCardDetails.expirationDate);
        assert.isNotNull(masterpassCardDetails.expirationMonth);
        assert.isNotNull(masterpassCardDetails.expirationYear);
        assert.isNotNull(masterpassCardDetails.healthcare);
        assert.isNotNull(masterpassCardDetails.imageUrl);
        assert.isNotNull(masterpassCardDetails.issuingBank);
        assert.isNotNull(masterpassCardDetails.last4);
        assert.isNotNull(masterpassCardDetails.maskedNumber);
        assert.isNotNull(masterpassCardDetails.payroll);
        assert.isNotNull(masterpassCardDetails.prepaid);
        assert.isNotNull(masterpassCardDetails.productId);
        assert.isNotNull(masterpassCardDetails.token);

        done();
      });
    });
  });
});
