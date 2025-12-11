"use strict";

let ValidationErrorCodes =
  require("../../../lib/braintree/validation_error_codes").ValidationErrorCodes;

let braintree = specHelper.braintree;

describe("MerchantGateway", function () {
  describe("create", () =>
    xit("creates a merchant", function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: "client_id$development$integration_client_id",
        clientSecret: "client_secret$development$integration_client_secret",
      });

      return gateway.merchant.create(
        {
          email: "name@email.com",
          countryCodeAlpha3: "GBR",
          paymentMethods: ["credit_card", "paypal"],
        },
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let merchant = response.merchant;

          assert.isNotNull(merchant.id);
          assert.equal(merchant.email, "name@email.com");
          assert.equal(merchant.companyName, "name@email.com");
          assert.equal(merchant.countryCodeAlpha3, "GBR");
          assert.equal(merchant.countryCodeAlpha2, "GB");
          assert.equal(merchant.countryCodeNumeric, "826");
          assert.equal(merchant.countryName, "United Kingdom");

          let credentials = response.credentials;

          assert.isNotNull(credentials.accessToken);
          assert.equal(credentials.accessToken.indexOf("access_token"), 0);
          assert.isNotNull(credentials.refreshToken);
          assert.isNotNull(credentials.expiresAt);
          assert.equal(credentials.tokenType, "bearer");

          done();
        }
      );
    }));

  it("returns an error when using invalid payment methods", function (done) {
    let gateway = new braintree.BraintreeGateway({
      clientId: "client_id$development$integration_client_id",
      clientSecret: "client_secret$development$integration_client_secret",
    });

    return gateway.merchant.create(
      {
        email: "name@email.com",
        countryCodeAlpha3: "USA",
        paymentMethods: ["fake_money"],
      },
      function (err, response) {
        assert.isNotNull(response.errors);
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("merchant").on("paymentMethods")[0].code,
          ValidationErrorCodes.Merchant.PaymentMethodsAreInvalid
        );

        done();
      }
    );
  });

  describe("create_multi_currency", function () {
    xit("creates a multi-currency merchant", function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: "client_id$development$integration_client_id",
        clientSecret: "client_secret$development$integration_client_secret",
      });

      return gateway.merchant.create(
        {
          email: "name@email.com",
          countryCodeAlpha3: "GBR",
          paymentMethods: ["credit_card", "paypal"],
          currencies: ["GBP", "USD"],
        },
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let merchant = response.merchant;

          assert.isNotNull(merchant.id);
          assert.equal(merchant.email, "name@email.com");
          assert.equal(merchant.companyName, "name@email.com");
          assert.equal(merchant.countryCodeAlpha3, "GBR");
          assert.equal(merchant.countryCodeAlpha2, "GB");
          assert.equal(merchant.countryCodeNumeric, "826");
          assert.equal(merchant.countryName, "United Kingdom");

          let credentials = response.credentials;

          assert.isNotNull(credentials.accessToken);
          assert.equal(credentials.accessToken.indexOf("access_token"), 0);
          assert.isNotNull(credentials.refreshToken);
          assert.isNotNull(credentials.expiresAt);
          assert.equal(credentials.tokenType, "bearer");

          let merchantAccounts = merchant.merchantAccounts;

          assert.equal(merchantAccounts.length, 2);

          let usdMerchantAccount = merchantAccounts.filter(
            (x) => x.id === "USD"
          )[0];

          assert.isNotNull(usdMerchantAccount);
          assert.equal(usdMerchantAccount.default, false);
          assert.equal(usdMerchantAccount.currencyIsoCode, "USD");

          let gbpMerchantAccount = merchantAccounts.filter(
            (x) => x.id === "GBP"
          )[0];

          assert.isNotNull(gbpMerchantAccount);
          assert.equal(gbpMerchantAccount.default, true);
          assert.equal(gbpMerchantAccount.currencyIsoCode, "GBP");

          done();
        }
      );
    });

    xit("creates a paypal-only merchant", function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: "client_id$development$integration_client_id",
        clientSecret: "client_secret$development$integration_client_secret",
      });

      return gateway.merchant.create(
        {
          email: "name@email.com",
          countryCodeAlpha3: "GBR",
          paymentMethods: ["paypal"],
          currencies: ["GBP", "USD"],
          paypalAccount: {
            clientId: "fake_client_id",
            clientSecret: "fake_client_secret",
          },
        },
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let merchant = response.merchant;

          assert.isNotNull(merchant.id);
          assert.equal(merchant.email, "name@email.com");
          assert.equal(merchant.companyName, "name@email.com");
          assert.equal(merchant.countryCodeAlpha3, "GBR");
          assert.equal(merchant.countryCodeAlpha2, "GB");
          assert.equal(merchant.countryCodeNumeric, "826");
          assert.equal(merchant.countryName, "United Kingdom");

          let credentials = response.credentials;

          assert.isNotNull(credentials.accessToken);
          assert.equal(credentials.accessToken.indexOf("access_token"), 0);
          assert.isNotNull(credentials.refreshToken);
          assert.isNotNull(credentials.expiresAt);
          assert.equal(credentials.tokenType, "bearer");

          let merchantAccounts = merchant.merchantAccounts;

          assert.equal(merchantAccounts.length, 2);

          let usdMerchantAccount = merchantAccounts.filter(
            (x) => x.id === "USD"
          )[0];

          assert.isNotNull(usdMerchantAccount);
          assert.equal(usdMerchantAccount.default, false);
          assert.equal(usdMerchantAccount.currencyIsoCode, "USD");

          let gbpMerchantAccount = merchantAccounts.filter(
            (x) => x.id === "GBP"
          )[0];

          assert.isNotNull(gbpMerchantAccount);
          assert.equal(gbpMerchantAccount.default, true);
          assert.equal(gbpMerchantAccount.currencyIsoCode, "GBP");

          done();
        }
      );
    });

    xit("allows creation of non-US merchant if onboarding application is internal", function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: "client_id$development$integration_client_id",
        clientSecret: "client_secret$development$integration_client_secret",
      });

      return gateway.merchant.create(
        {
          email: "name@email.com",
          countryCodeAlpha3: "GBR",
          paymentMethods: ["paypal"],
          paypalAccount: {
            clientId: "fake_client_id",
            clientSecret: "fake_client_secret",
          },
        },
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let merchant = response.merchant;

          assert.isNotNull(merchant.id);
          assert.equal(merchant.email, "name@email.com");
          assert.equal(merchant.companyName, "name@email.com");
          assert.equal(merchant.countryCodeAlpha3, "GBR");
          assert.equal(merchant.countryCodeAlpha2, "GB");
          assert.equal(merchant.countryCodeNumeric, "826");
          assert.equal(merchant.countryName, "United Kingdom");

          let credentials = response.credentials;

          assert.isNotNull(credentials.accessToken);
          assert.equal(credentials.accessToken.indexOf("access_token"), 0);
          assert.isNotNull(credentials.refreshToken);
          assert.isNotNull(credentials.expiresAt);
          assert.equal(credentials.tokenType, "bearer");

          let merchantAccounts = merchant.merchantAccounts;

          assert.equal(merchantAccounts.length, 1);

          let merchantAccount = merchantAccounts[0];

          assert.equal(merchantAccount.default, true);
          assert.equal(merchantAccount.currencyIsoCode, "GBP");

          done();
        }
      );
    });

    it("returns error if invalid currency is passed", function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: "client_id$development$integration_client_id",
        clientSecret: "client_secret$development$integration_client_secret",
      });

      return gateway.merchant.create(
        {
          email: "name@email.com",
          countryCodeAlpha3: "GBR",
          paymentMethods: ["paypal"],
          currencies: ["FAKE", "USD"],
          paypalAccount: {
            clientId: "fake_client_id",
            clientSecret: "fake_client_secret",
          },
        },
        function (err, response) {
          assert.isNotNull(response.errors);
          assert.isFalse(response.success);

          assert.equal(
            response.errors.for("merchant").on("currencies")[0].code,
            ValidationErrorCodes.Merchant.CurrenciesAreInvalid
          );

          done();
        }
      );
    });
  });
});
