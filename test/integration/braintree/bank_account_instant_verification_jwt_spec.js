"use strict";

let braintree = specHelper.braintree;
let BankAccountInstantVerificationJwtRequest =
  braintree.BankAccountInstantVerificationJwtRequest;
let http = require("http");
let https = require("https");
let uri = require("url");

describe("BankAccountInstantVerification", function () {
  let gateway, usBankGateway;

  beforeEach(function () {
    gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Development,
      merchantId: "integration2_merchant_id",
      publicKey: "integration2_public_key",
      privateKey: "integration2_private_key",
    });

    usBankGateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Development,
      merchantId: "integration_merchant_id",
      publicKey: "integration_public_key",
      privateKey: "integration_private_key",
    });
  });

  // Generates a US bank account nonce without ACH mandate using Open Banking REST API
  function generateUsBankAccountNonceWithoutAchMandate(callback) {
    let config = {
      environment: braintree.Environment.Development,
      merchantId: "integration_merchant_id",
      publicKey: "integration_public_key",
      privateKey: "integration_private_key",
    };

    let gateway = new braintree.BraintreeGateway(config);

    // Request body for Open Banking tokenization
    let requestBody = {
      /* eslint-disable camelcase */
      account_details: {
        account_number: "567891234",
        account_type: "CHECKING",
        classification: "PERSONAL",
        tokenized_account: true,
        last_4: "1234",
      },
      institution_details: {
        bank_id: {
          bank_code: "021000021",
          country_code: "US",
        },
      },
      account_holders: [
        {
          ownership: "PRIMARY",
          full_name: {
            name: "Dan Schulman",
          },
          name: {
            given_name: "Dan",
            surname: "Schulman",
            full_name: "Dan Schulman",
          },
        },
      ],
      /* eslint-enable camelcase */
    };

    // Build the API URL
    let graphQLBaseUrl = gateway.config.baseGraphQLUrl();
    let atmosphereBaseUrl = graphQLBaseUrl.replace("/graphql", "");
    let url =
      atmosphereBaseUrl + "/v1/open-finance/tokenize-bank-account-details";
    let jsonBody = JSON.stringify(requestBody);

    let parsedUrl = uri.parse(url);
    let httpModule = parsedUrl.protocol === "https:" ? https : http;

    let options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Braintree-Version": "2019-01-01",
        "User-Agent": "Braintree Node Library " + braintree.version,
        "X-ApiVersion": gateway.config.apiVersion,
        Authorization:
          "Basic " +
          Buffer.from(
            gateway.config.publicKey + ":" + gateway.config.privateKey
          ).toString("base64"),
      },
    };

    let req = httpModule.request(options, function (res) {
      let responseData = "";

      res.on("data", function (chunk) {
        responseData += chunk;
      });

      res.on("end", function () {
        if (res.statusCode !== 200) {
          return callback(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }

        try {
          let response = JSON.parse(responseData);

          if (!response.tenant_token) {
            return callback(
              new Error(
                "Open Banking tokenization failed: " + JSON.stringify(response)
              )
            );
          }

          return callback(null, response.tenant_token);
        } catch (error) {
          return callback(
            new Error("Failed to parse response: " + error.message)
          );
        }
      });
    });

    req.on("error", function (error) {
      callback(error);
    });

    req.write(jsonBody);
    req.end();
  }
  describe("createJwt", function () {
    it("succeeds with valid request", function (done) {
      let request = new BankAccountInstantVerificationJwtRequest()
        .businessName("15Ladders")
        .returnUrl("https://example.com/success")
        .cancelUrl("https://example.com/cancel");

      gateway.bankAccountInstantVerification.createJwt(
        request,
        function (err, response) {
          assert.isNull(
            err,
            "Expected success but got error: " + (err ? err.message : "none")
          );
          assert.isTrue(
            response.success,
            "Expected success but got: " +
              (response.success
                ? "success"
                : "failure with errors: " +
                  JSON.stringify(response.errors || "no errors"))
          );
          assert.isObject(response.target);
          assert.isString(response.target.getJwt());
          assert.isTrue(response.target.getJwt().length > 0);

          // JWT tokens should start with "eyJ" when base64 encoded
          assert.isTrue(response.target.getJwt().startsWith("eyJ"));

          done();
        }
      );
    });

    it("fails with invalid business name", function (done) {
      let request = new BankAccountInstantVerificationJwtRequest()
        .businessName("") // Empty business name should cause validation error
        .returnUrl("https://example.com/return")
        .cancelUrl("https://example.com/cancel");

      gateway.bankAccountInstantVerification.createJwt(
        request,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, "Expected failure but got success");
          assert.isObject(response.errors, "Expected errors but got none");

          done();
        }
      );
    });

    it("fails with invalid URLs", function (done) {
      let request = new BankAccountInstantVerificationJwtRequest()
        .businessName("15Ladders")
        .returnUrl("not-a-valid-url")
        .cancelUrl("also-not-valid");

      usBankGateway.bankAccountInstantVerification.createJwt(
        request,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success, "Expected failure but got success");
          assert.isObject(response.errors, "Expected errors but got none");

          done();
        }
      );
    });

    it("succeeds with only valid returnUrl", function (done) {
      let request = new BankAccountInstantVerificationJwtRequest()
        .businessName("15Ladders")
        .returnUrl("https://example.com/return");

      gateway.bankAccountInstantVerification.createJwt(
        request,
        function (err, response) {
          assert.isNull(
            err,
            "Expected success but got error: " + (err ? err.message : "none")
          );
          assert.isTrue(
            response.success,
            "Expected success but got: " +
              (response.success
                ? "success"
                : "failure with errors: " +
                  JSON.stringify(response.errors || "no errors"))
          );
          assert.isObject(response.target);
          assert.isString(response.target.getJwt());
          assert.isTrue(response.target.getJwt().length > 0);

          // JWT tokens should start with "eyJ" when base64 encoded
          assert.isTrue(response.target.getJwt().startsWith("eyJ"));

          done();
        }
      );
    });
  });

  describe("charge US bank with ACH mandate", function () {
    it("creates transaction directly with nonce and provides ACH mandate at transaction time (instant verification)", function (done) {
      // Create bank account token without ACH mandate (using Open Banking pattern)
      generateUsBankAccountNonceWithoutAchMandate(function (err, nonce) {
        assert.isNull(
          err,
          "Failed to generate nonce: " + (err ? err.message : "none")
        );
        assert.isString(nonce, "Expected nonce to be a string");

        let mandateAcceptedAt = new Date();

        mandateAcceptedAt.setMinutes(mandateAcceptedAt.getMinutes() - 5);

        // Create transaction directly with nonce and provide ACH mandate at transaction time (instant verification)
        usBankGateway.transaction.sale(
          {
            amount: "12.34",
            paymentMethodNonce: nonce,
            merchantAccountId: "us_bank_merchant_account",
            usBankAccount: {
              achMandateText: "I authorize this transaction and future debits",
              achMandateAcceptedAt: mandateAcceptedAt,
            },
            options: {
              submitForSettlement: true,
            },
          },
          function (err, transactionResult) {
            assert.isNull(
              err,
              "Expected transaction success but got error: " +
                (err ? err.message : "none")
            );
            assert.isTrue(
              transactionResult.success,
              "Expected transaction success but got: " +
                (transactionResult.success
                  ? "success"
                  : "failure with errors: " +
                    JSON.stringify(transactionResult.errors || "no errors"))
            );
            let transaction = transactionResult.transaction;

            assert.equal(
              "Dan Schulman",
              transaction.usBankAccount.accountHolderName
            );
            assert.equal("1234", transaction.usBankAccount.last4);
            assert.equal("021000021", transaction.usBankAccount.routingNumber);
            assert.equal("checking", transaction.usBankAccount.accountType);

            done();
          }
        );
      });
    });
  });

  describe("Open Finance flow with INSTANT_VERIFICATION_ACCOUNT_VALIDATION", function () {
    it("tokenizes bank account via Open Finance API, vaults with and charges", function (done) {
      generateUsBankAccountNonceWithoutAchMandate(function (err, nonce) {
        assert.isNull(
          err,
          "Failed to generate nonce: " + (err ? err.message : "none")
        );
        assert.isString(nonce, "Expected nonce to be a string");

        usBankGateway.customer.create({}, function (err, customerResult) {
          assert.isNull(err);
          assert.isTrue(customerResult.success);
          let customer = customerResult.customer;

          let mandateAcceptedAt = new Date();

          mandateAcceptedAt.setMinutes(mandateAcceptedAt.getMinutes() - 5);

          // First vault the payment method with INSTANT_VERIFICATION_ACCOUNT_VALIDATION
          usBankGateway.paymentMethod.create(
            {
              customerId: customer.id,
              paymentMethodNonce: nonce,
              usBankAccount: {
                achMandateText:
                  "I authorize this transaction and future debits",
                achMandateAcceptedAt: mandateAcceptedAt,
              },
              options: {
                verificationMerchantAccountId: "us_bank_merchant_account",
                usBankAccountVerificationMethod:
                  braintree.UsBankAccountVerification.VerificationMethod
                    .InstantVerificationAccountValidation,
              },
            },
            function (err, paymentMethodResult) {
              assert.isNull(
                err,
                "Expected payment method creation success but got error: " +
                  (err ? err.message : "none")
              );
              assert.isTrue(
                paymentMethodResult.success,
                "Expected payment method creation success but got: " +
                  (paymentMethodResult.success
                    ? "success"
                    : "failure with errors: " +
                      JSON.stringify(paymentMethodResult.errors || "no errors"))
              );

              let usBankAccount = paymentMethodResult.paymentMethod;

              // Verify ACH mandate details
              assert.isObject(usBankAccount.achMandate);
              assert.equal(
                "I authorize this transaction and future debits",
                usBankAccount.achMandate.text
              );
              assert.instanceOf(usBankAccount.achMandate.acceptedAt, Date);

              // Verify bank account details
              assert.equal("1234", usBankAccount.last4);
              assert.equal("021000021", usBankAccount.routingNumber);
              assert.equal("checking", usBankAccount.accountType);

              // Verify verification details
              assert.isArray(usBankAccount.verifications);
              assert.isTrue(usBankAccount.verifications.length >= 1);
              assert.equal(
                braintree.UsBankAccountVerification.VerificationMethod
                  .InstantVerificationAccountValidation,
                usBankAccount.verifications[0].verificationMethod
              );
              assert.equal("verified", usBankAccount.verifications[0].status);

              // Now charge the vaulted payment method
              usBankGateway.transaction.sale(
                {
                  amount: "12.34",
                  paymentMethodToken: usBankAccount.token,
                  merchantAccountId: "us_bank_merchant_account",
                  options: {
                    submitForSettlement: true,
                  },
                },
                function (err, transactionResult) {
                  assert.isNull(
                    err,
                    "Expected transaction success but got error: " +
                      (err ? err.message : "none")
                  );
                  assert.isTrue(
                    transactionResult.success,
                    "Expected transaction success but got: " +
                      (transactionResult.success
                        ? "success"
                        : "failure with errors: " +
                          JSON.stringify(
                            transactionResult.errors || "no errors"
                          ))
                  );

                  let transaction = transactionResult.transaction;

                  // Verify transaction details
                  assert.isString(transaction.id);
                  assert.equal("12.34", transaction.amount);
                  assert.isObject(transaction.usBankAccount);

                  // Verify ACH mandate is preserved in transaction
                  assert.isObject(
                    transaction.usBankAccount.achMandate,
                    "Expected achMandate to be an object"
                  );
                  assert.equal(
                    "I authorize this transaction and future debits",
                    transaction.usBankAccount.achMandate.text
                  );
                  assert.instanceOf(
                    transaction.usBankAccount.achMandate.acceptedAt,
                    Date,
                    "Expected acceptedAt to be a Date"
                  );

                  // Verify bank account details in transaction
                  assert.equal(
                    "Dan Schulman",
                    transaction.usBankAccount.accountHolderName
                  );
                  assert.equal("1234", transaction.usBankAccount.last4);
                  assert.equal(
                    "021000021",
                    transaction.usBankAccount.routingNumber
                  );
                  assert.equal(
                    "checking",
                    transaction.usBankAccount.accountType
                  );

                  done();
                }
              );
            }
          );
        });
      });
    });
  });
});
