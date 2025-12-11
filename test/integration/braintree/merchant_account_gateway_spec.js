"use strict";
/* eslint-disable camelcase */

let braintree = specHelper.braintree;
let ValidationErrorCodes =
  require("../../../lib/braintree/validation_error_codes").ValidationErrorCodes;

describe("MerchantAccountGateway", function () {
  describe("find", function () {
    it("retrieves a master merchant accounts currency iso code", (done) =>
      specHelper.defaultGateway.merchantAccount.find(
        "sandbox_master_merchant_account",
        function (err, merchantAccount) {
          assert.equal(merchantAccount.currencyIsoCode, "USD");

          done();
        }
      ));

    it("returns a not found error if given a bad id", (done) =>
      specHelper.defaultGateway.merchantAccount.find(" ", function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      }));
  });

  describe("all", function () {
    context("using a callback", function () {
      it("returns all merchant accounts", function (done) {
        let gateway = new braintree.BraintreeGateway({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret",
        });

        specHelper.createToken(
          gateway,
          { merchantPublicId: "integration_merchant_id", scope: "read_write" },
          function (err, response) {
            gateway = new braintree.BraintreeGateway({
              accessToken: response.credentials.accessToken,
            });

            return gateway.merchantAccount.all(function (
              err,
              merchantAccounts
            ) {
              assert.equal(true, merchantAccounts.length > 20);
              done();
            });
          }
        );
      });

      it("handles a response containing a single merchant account", function (done) {
        return specHelper.getMerchant(function (err, response) {
          let gateway = new braintree.BraintreeGateway({
            accessToken: response.credentials.accessToken,
          });

          return gateway.merchantAccount.all(function (err, merchantAccounts) {
            assert.isNull(err);
            assert.isTrue(merchantAccounts.length > 0);
            assert.equal(merchantAccounts[0].status, "active");
            done();
          });
        });
      });

      it("returns a merchant account with correct attributes", function (done) {
        return specHelper.getMerchant(function (err, response) {
          let gateway = new braintree.BraintreeGateway({
            accessToken: response.credentials.accessToken,
          });

          return gateway.merchantAccount.all(function (err, merchantAccounts) {
            assert.isNull(err);
            assert.isTrue(merchantAccounts.length > 0);

            let merchantAccount = merchantAccounts[0];

            assert.equal(merchantAccount.status, "active");
            done();
          });
        });
      });

      it("gracefully handles errors", function (done) {
        let gateway = new braintree.BraintreeGateway({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret",
        });

        specHelper.createToken(
          gateway,
          { merchantPublicId: "integration_merchant_id", scope: "read_write" },
          function (err, response) {
            gateway = new braintree.BraintreeGateway({
              accessToken: response.credentials.accessToken,
            });

            gateway.config.merchantId = "nonexistantmerchant";

            return gateway.merchantAccount.all(function (err) {
              assert(err);
              assert.equal(err.type, braintree.errorTypes.authenticationError);
              done();
            });
          }
        );
      });
    });

    context("using a stream", function () {
      it("returns a stream if no callback is provided", function (done) {
        let gateway = new braintree.BraintreeGateway({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret",
        });

        specHelper.createToken(
          gateway,
          { merchantPublicId: "integration_merchant_id", scope: "read_write" },
          function (err, response) {
            gateway = new braintree.BraintreeGateway({
              accessToken: response.credentials.accessToken,
            });

            let merchantAccounts = [];
            let merchantAccountStream = gateway.merchantAccount.all();

            merchantAccountStream.on("data", (data) =>
              merchantAccounts.push(data)
            );

            return merchantAccountStream.on("end", function () {
              assert.equal(true, merchantAccounts.length > 20);
              done();
            });
          }
        );
      });

      it("returns a merchant account with correct attributes", function (done) {
        return specHelper.getMerchant(function (err, response) {
          let gateway = new braintree.BraintreeGateway({
            accessToken: response.credentials.accessToken,
          });
          let merchantAccounts = [];
          let merchantAccountStream = gateway.merchantAccount.all();

          merchantAccountStream.on("data", (data) =>
            merchantAccounts.push(data)
          );

          return merchantAccountStream.on("end", function () {
            assert.isTrue(merchantAccounts.length > 0);
            let merchantAccount = merchantAccounts[0];

            assert.equal(merchantAccount.status, "active");
            done();
          });
        });
      });

      it("gracefully handles errors", function (done) {
        let gateway = new braintree.BraintreeGateway({
          clientId: "client_id$development$integration_client_id",
          clientSecret: "client_secret$development$integration_client_secret",
        });

        specHelper.createToken(
          gateway,
          { merchantPublicId: "integration_merchant_id", scope: "read_write" },
          function (err, response) {
            gateway = new braintree.BraintreeGateway({
              accessToken: response.credentials.accessToken,
            });

            gateway.config.merchantId = "nonexistantmerchant";

            let merchantAccountStream = gateway.merchantAccount.all();

            merchantAccountStream.on("error", function (error) {
              assert.equal(
                error.type,
                braintree.errorTypes.authenticationError
              );
              done();
            });

            merchantAccountStream.on("data", function () {
              throw new Error("Should not have data");
            });

            return merchantAccountStream.on("end", function () {
              throw new Error("Should not have ended");
            });
          }
        );
      });
    });
  });

  describe("createForCurrency", function () {
    it("creates a new merchant account for currency", function (done) {
      return specHelper.getMerchant(function (err, response) {
        let gateway = new braintree.BraintreeGateway({
          accessToken: response.credentials.accessToken,
        });

        return gateway.merchantAccount.createForCurrency(
          {
            currency: "AUD",
          },
          function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            assert.equal(response.merchantAccount.currencyIsoCode, "AUD");
            done();
          }
        );
      });
    });

    it("returns error if merchant account exists for currency", function (done) {
      return specHelper.getMerchant(function (err, response) {
        let gateway = new braintree.BraintreeGateway({
          accessToken: response.credentials.accessToken,
        });

        return gateway.merchantAccount.createForCurrency(
          {
            currency: "CAD",
          },
          function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            return gateway.merchantAccount.createForCurrency(
              {
                currency: "CAD",
              },
              function (err, response) {
                assert.isNotNull(response.errors);
                assert.isFalse(response.success);

                assert.equal(
                  response.errors.for("merchant").on("currency")[0].code,
                  ValidationErrorCodes.Merchant.MerchantAccountExistsForCurrency
                );
                done();
              }
            );
          }
        );
      });
    });

    it("returns error if currency is not provided", function (done) {
      return specHelper.getMerchant(function (err, response) {
        let gateway = new braintree.BraintreeGateway({
          accessToken: response.credentials.accessToken,
        });

        return gateway.merchantAccount.createForCurrency(
          {},
          function (err, response) {
            assert.isNotNull(response.errors);
            assert.isFalse(response.success);

            assert.equal(
              response.errors.for("merchant").on("currency")[0].code,
              ValidationErrorCodes.Merchant.CurrencyIsRequired
            );

            done();
          }
        );
      });
    });

    it("returns error if currency is invalid", function (done) {
      return specHelper.getMerchant(function (err, response) {
        let gateway = new braintree.BraintreeGateway({
          accessToken: response.credentials.accessToken,
        });

        return gateway.merchantAccount.createForCurrency(
          {
            currency: "fake_currency",
          },
          function (err, response) {
            assert.isNotNull(response.errors);
            assert.isFalse(response.success);

            assert.equal(
              response.errors.for("merchant").on("currency")[0].code,
              ValidationErrorCodes.Merchant.CurrencyIsInvalid
            );

            done();
          }
        );
      });
    });

    it("returns error if merchant account exists for id", function (done) {
      return specHelper.getMerchant(function (err, response) {
        let gateway = new braintree.BraintreeGateway({
          accessToken: response.credentials.accessToken,
        });

        gateway.merchantAccount.createForCurrency(
          {
            currency: "GBP",
            id: response.merchant.merchantAccounts[0].id,
          },
          function (err, response) {
            assert.isNotNull(response.errors);
            assert.isFalse(response.success);

            assert.equal(
              response.errors.for("merchant").on("id")[0].code,
              ValidationErrorCodes.Merchant.MerchantAccountExistsForId
            );

            done();
          }
        );
      });
    });
  });
});
