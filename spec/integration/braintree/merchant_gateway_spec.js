'use strict';

require('../../spec_helper');
let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;

let braintree = specHelper.braintree;

describe('MerchantGateway', function () {
  describe('create', () =>
    it('creates a merchant', function (done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      return gateway.merchant.create({email: 'name@email.com', countryCodeAlpha3: 'USA', paymentMethods: ['credit_card', 'paypal']}, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        let merchant = response.merchant;

        assert.isNotNull(merchant.id);
        assert.equal(merchant.email, 'name@email.com');
        assert.equal(merchant.companyName, 'name@email.com');
        assert.equal(merchant.countryCodeAlpha3, 'USA');
        assert.equal(merchant.countryCodeAlpha2, 'US');
        assert.equal(merchant.countryCodeNumeric, '840');
        assert.equal(merchant.countryName, 'United States of America');

        let credentials = response.credentials;

        assert.isNotNull(credentials.accessToken);
        assert.equal(credentials.accessToken.indexOf('access_token'), 0);
        assert.isNotNull(credentials.refreshToken);
        assert.isNotNull(credentials.expiresAt);
        assert.equal(credentials.tokenType, 'bearer');

        done();
      });
    })
  );

  it('returns an error when using invalid payment methods', function (done) {
    let gateway = braintree.connect({
      clientId: 'client_id$development$integration_client_id',
      clientSecret: 'client_secret$development$integration_client_secret'
    });

    return gateway.merchant.create({email: 'name@email.com', countryCodeAlpha3: 'USA', paymentMethods: ['fake_money']}, function (err, response) {
      assert.isNotNull(response.errors);
      assert.isFalse(response.success);

      assert.equal(
        response.errors.for('merchant').on('paymentMethods')[0].code,
        ValidationErrorCodes.Merchant.PaymentMethodsAreInvalid
      );

      done();
    });
  });

  describe('create_multi_currency', function () {
    it('creates a multi-currency merchant', function (done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'USA',
        paymentMethods: ['credit_card', 'paypal'],
        currencies: ['GBP', 'USD']
      }, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        let merchant = response.merchant;

        assert.isNotNull(merchant.id);
        assert.equal(merchant.email, 'name@email.com');
        assert.equal(merchant.companyName, 'name@email.com');
        assert.equal(merchant.countryCodeAlpha3, 'USA');
        assert.equal(merchant.countryCodeAlpha2, 'US');
        assert.equal(merchant.countryCodeNumeric, '840');
        assert.equal(merchant.countryName, 'United States of America');

        let credentials = response.credentials;

        assert.isNotNull(credentials.accessToken);
        assert.equal(credentials.accessToken.indexOf('access_token'), 0);
        assert.isNotNull(credentials.refreshToken);
        assert.isNotNull(credentials.expiresAt);
        assert.equal(credentials.tokenType, 'bearer');

        let merchantAccounts = merchant.merchantAccounts;

        assert.equal(merchantAccounts.length, 2);

        let usdMerchantAccount = (merchantAccounts.filter(x => x.id === 'USD'))[0];

        assert.isNotNull(usdMerchantAccount);
        assert.equal(usdMerchantAccount.default, true);
        assert.equal(usdMerchantAccount.currencyIsoCode, 'USD');

        let gbpMerchantAccount = (merchantAccounts.filter(x => x.id === 'GBP'))[0];

        assert.isNotNull(gbpMerchantAccount);
        assert.equal(gbpMerchantAccount.default, false);
        assert.equal(gbpMerchantAccount.currencyIsoCode, 'GBP');

        done();
      });
    });

    it('creates a paypal-only merchant', function (done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'USA',
        paymentMethods: ['paypal'],
        currencies: ['GBP', 'USD'],
        paypalAccount: {
          clientId: 'fake_client_id',
          clientSecret: 'fake_client_secret'
        }
      }, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        let merchant = response.merchant;

        assert.isNotNull(merchant.id);
        assert.equal(merchant.email, 'name@email.com');
        assert.equal(merchant.companyName, 'name@email.com');
        assert.equal(merchant.countryCodeAlpha3, 'USA');
        assert.equal(merchant.countryCodeAlpha2, 'US');
        assert.equal(merchant.countryCodeNumeric, '840');
        assert.equal(merchant.countryName, 'United States of America');

        let credentials = response.credentials;

        assert.isNotNull(credentials.accessToken);
        assert.equal(credentials.accessToken.indexOf('access_token'), 0);
        assert.isNotNull(credentials.refreshToken);
        assert.isNotNull(credentials.expiresAt);
        assert.equal(credentials.tokenType, 'bearer');

        let merchantAccounts = merchant.merchantAccounts;

        assert.equal(merchantAccounts.length, 2);

        let usdMerchantAccount = (merchantAccounts.filter(x => x.id === 'USD'))[0];

        assert.isNotNull(usdMerchantAccount);
        assert.equal(usdMerchantAccount.default, true);
        assert.equal(usdMerchantAccount.currencyIsoCode, 'USD');

        let gbpMerchantAccount = (merchantAccounts.filter(x => x.id === 'GBP'))[0];

        assert.isNotNull(gbpMerchantAccount);
        assert.equal(gbpMerchantAccount.default, false);
        assert.equal(gbpMerchantAccount.currencyIsoCode, 'GBP');

        done();
      });
    });

    it('allows creation of non-US merchant if onboarding application is internal', function (done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'JPN',
        paymentMethods: ['paypal'],
        paypalAccount: {
          clientId: 'fake_client_id',
          clientSecret: 'fake_client_secret'
        }
      }, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        let merchant = response.merchant;

        assert.isNotNull(merchant.id);
        assert.equal(merchant.email, 'name@email.com');
        assert.equal(merchant.companyName, 'name@email.com');
        assert.equal(merchant.countryCodeAlpha3, 'JPN');
        assert.equal(merchant.countryCodeAlpha2, 'JP');
        assert.equal(merchant.countryCodeNumeric, '392');
        assert.equal(merchant.countryName, 'Japan');

        let credentials = response.credentials;

        assert.isNotNull(credentials.accessToken);
        assert.equal(credentials.accessToken.indexOf('access_token'), 0);
        assert.isNotNull(credentials.refreshToken);
        assert.isNotNull(credentials.expiresAt);
        assert.equal(credentials.tokenType, 'bearer');

        let merchantAccounts = merchant.merchantAccounts;

        assert.equal(merchantAccounts.length, 1);

        let merchantAccount = merchantAccounts[0];

        assert.equal(merchantAccount.default, true);
        assert.equal(merchantAccount.currencyIsoCode, 'JPY');

        done();
      });
    });

    it('defaults to USD for non-US merchant if onboarding application is internal and country currency not supported', function (done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'YEM',
        paymentMethods: ['paypal'],
        paypalAccount: {
          clientId: 'fake_client_id',
          clientSecret: 'fake_client_secret'
        }
      }, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        let merchant = response.merchant;

        assert.isNotNull(merchant.id);
        assert.equal(merchant.email, 'name@email.com');
        assert.equal(merchant.companyName, 'name@email.com');
        assert.equal(merchant.countryCodeAlpha3, 'YEM');
        assert.equal(merchant.countryCodeAlpha2, 'YE');
        assert.equal(merchant.countryCodeNumeric, '887');
        assert.equal(merchant.countryName, 'Yemen');

        let credentials = response.credentials;

        assert.isNotNull(credentials.accessToken);
        assert.equal(credentials.accessToken.indexOf('access_token'), 0);
        assert.isNotNull(credentials.refreshToken);
        assert.isNotNull(credentials.expiresAt);
        assert.equal(credentials.tokenType, 'bearer');

        let merchantAccounts = merchant.merchantAccounts;

        assert.equal(merchantAccounts.length, 1);

        let merchantAccount = merchantAccounts[0];

        assert.equal(merchantAccount.default, true);
        assert.equal(merchantAccount.currencyIsoCode, 'USD');

        done();
      });
    });

    it('returns error if invalid currency is passed', function (done) {
      let gateway = braintree.connect({
        clientId: 'client_id$development$signup_client_id',
        clientSecret: 'client_secret$development$signup_client_secret'
      });

      return gateway.merchant.create({
        email: 'name@email.com',
        countryCodeAlpha3: 'USA',
        paymentMethods: ['paypal'],
        currencies: ['FAKE', 'USD'],
        paypalAccount: {
          clientId: 'fake_client_id',
          clientSecret: 'fake_client_secret'
        }
      }, function (err, response) {
        assert.isNotNull(response.errors);
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for('merchant').on('currencies')[0].code,
          ValidationErrorCodes.Merchant.CurrenciesAreInvalid
        );

        done();
      });
    });
  });
});
