"use strict";

let Braintree = require("../../../lib/braintree");
let TransactionAmounts = Braintree.Test.TransactionAmounts;

describe("TransactionIdempotency", function () {
  describe("sale", function () {
    it("returns original transaction on duplicate request with same api request key", function (done) {
      let apiRequestKey =
        "idempotency-key-" + Math.floor(Math.random() * 1000000);

      let transactionParams = {
        amount: TransactionAmounts.Authorize,
        apiRequestKey: apiRequestKey,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        function (err, result1) {
          assert.isNull(err);
          assert.isTrue(result1.success);
          assert.isNotNull(result1.transaction.id);
          let transaction1 = result1.transaction;

          specHelper.defaultGateway.transaction.sale(
            transactionParams,
            function (err, result2) {
              assert.isNull(err);
              assert.isTrue(result2.success);
              let transaction2 = result2.transaction;

              assert.equal(transaction1.status, transaction2.status);

              done();
            }
          );
        }
      );
    });

    it("fails when different request used with same key", function (done) {
      let apiRequestKey =
        "idempotency-key-" + Math.floor(Math.random() * 1000000);

      let transactionParams1 = {
        amount: TransactionAmounts.Authorize,
        apiRequestKey: apiRequestKey,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams1,
        function (err, result1) {
          assert.isNull(err);
          assert.isTrue(result1.success);

          let transactionParams2 = {
            amount: "200.00",
            apiRequestKey: apiRequestKey,
            creditCard: {
              number: "4111111111111111",
              expirationDate: "05/2035",
            },
          };

          specHelper.defaultGateway.transaction.sale(
            transactionParams2,
            function (err, result2) {
              assert.isFalse(result2.success);
              assert.isNotNull(result2.errors);
              let errors = result2.errors.deepErrors();

              assert.isTrue(errors.length > 0);
              assert.equal(
                errors[0].code,
                Braintree.ValidationErrorCodes.Transaction
                  .ApiRequestKeyCanBeReusedOnlyWithTheSameRequest
              );

              done();
            }
          );
        }
      );
    });

    it("same sales with different api request keys create different transactions", function (done) {
      let apiRequestKey1 =
        "idempotency-key-" + Math.floor(Math.random() * 1000000);

      let transactionParams1 = {
        amount: TransactionAmounts.Authorize,
        apiRequestKey: apiRequestKey1,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams1,
        function (err, result1) {
          assert.isNull(err);
          assert.isTrue(result1.success);
          let transaction1 = result1.transaction;

          assert.isNotNull(transaction1.id);

          let apiRequestKey2 =
            "idempotency-key-" + Math.floor(Math.random() * 1000000);
          let transactionParams2 = {
            amount: TransactionAmounts.Authorize,
            apiRequestKey: apiRequestKey2,
            creditCard: {
              number: "4111111111111111",
              expirationDate: "05/2035",
            },
          };

          specHelper.defaultGateway.transaction.sale(
            transactionParams2,
            function (err, result2) {
              assert.isNull(err);
              assert.isTrue(result2.success);
              let transaction2 = result2.transaction;

              assert.notEqual(transaction1.id, transaction2.id);

              done();
            }
          );
        }
      );
    });

    it("fails when api request key is too big", function (done) {
      let transactionParams1 = {
        amount: TransactionAmounts.Authorize,
        apiRequestKey: "x".repeat(255),
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams1,
        function (err, result1) {
          assert.isNull(err);
          assert.isTrue(result1.success);

          let transactionParams2 = {
            amount: "200.00",
            apiRequestKey: "x".repeat(256),
            creditCard: {
              number: "4111111111111111",
              expirationDate: "05/2035",
            },
          };

          specHelper.defaultGateway.transaction.sale(
            transactionParams2,
            function (err, result2) {
              assert.isFalse(result2.success);
              assert.isNotNull(result2.errors);
              let errors = result2.errors.deepErrors();

              assert.isTrue(errors.length > 0);
              assert.equal(
                errors[0].code,
                Braintree.ValidationErrorCodes.Transaction.ApiRequestKeyTooLong
              );

              done();
            }
          );
        }
      );
    });
  });

  describe("credit", function () {
    it("returns original on duplicate request with same api request key", function (done) {
      let apiRequestKey =
        "credit-idempotency-key-" + Math.floor(Math.random() * 1000000);

      let transactionParams = {
        amount: TransactionAmounts.Authorize,
        apiRequestKey: apiRequestKey,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
      };

      specHelper.defaultGateway.transaction.credit(
        transactionParams,
        function (err, creditResult1) {
          assert.isNull(err);
          assert.isTrue(creditResult1.success);
          let creditTransaction1 = creditResult1.transaction;

          assert.equal("credit", creditTransaction1.type);
          assert.isNotNull(creditTransaction1.id);

          specHelper.defaultGateway.transaction.credit(
            transactionParams,
            function (err, creditResult2) {
              assert.isNull(err);
              assert.isTrue(creditResult2.success);
              let creditTransaction2 = creditResult2.transaction;

              assert.equal(creditTransaction1.id, creditTransaction2.id);
              assert.equal(creditTransaction1.type, creditTransaction2.type);

              done();
            }
          );
        }
      );
    });
  });

  describe("submitForPartialSettlement", function () {
    it("returns original on duplicate request with same api request key", function (done) {
      let apiRequestKey =
        "partial-settlement-idempotency-key-" +
        Math.floor(Math.random() * 1000000);

      let saleRequest = {
        amount: TransactionAmounts.Authorize,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        saleRequest,
        function (err, saleResult) {
          assert.isNull(err);
          assert.isTrue(saleResult.success);
          let transactionId = saleResult.transaction.id;

          let partialAmount = "50.00";
          let partialSettlementRequest = {
            amount: partialAmount,
            apiRequestKey: apiRequestKey,
          };

          specHelper.defaultGateway.transaction.submitForPartialSettlement(
            transactionId,
            partialAmount,
            partialSettlementRequest,
            function (err, partialSettlementResult1) {
              assert.isNull(err);
              assert.isTrue(partialSettlementResult1.success);
              let partialSettlementTransaction1 =
                partialSettlementResult1.transaction;

              assert.equal(partialAmount, partialSettlementTransaction1.amount);
              assert.isNotNull(partialSettlementTransaction1.id);

              specHelper.defaultGateway.transaction.submitForPartialSettlement(
                transactionId,
                partialAmount,
                partialSettlementRequest,
                function (err, partialSettlementResult2) {
                  assert.isNull(err);
                  assert.isTrue(partialSettlementResult2.success);
                  let partialSettlementTransaction2 =
                    partialSettlementResult2.transaction;

                  assert.equal(
                    partialSettlementTransaction1.id,
                    partialSettlementTransaction2.id
                  );
                  assert.equal(
                    partialSettlementTransaction1.amount,
                    partialSettlementTransaction2.amount
                  );

                  done();
                }
              );
            }
          );
        }
      );
    });
  });

  describe("submitForSettlement", function () {
    it("returns original on duplicate request with same api request key", function (done) {
      let apiRequestKey =
        "settlement-idempotency-key-" + Math.floor(Math.random() * 1000000);

      let saleRequest = {
        amount: TransactionAmounts.Authorize,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        saleRequest,
        function (err, saleResult) {
          assert.isNull(err);
          assert.isTrue(saleResult.success);
          let transactionId = saleResult.transaction.id;
          let originalAmount = saleResult.transaction.amount;

          let settlementRequest = {
            apiRequestKey: apiRequestKey,
          };

          specHelper.defaultGateway.transaction.submitForSettlement(
            transactionId,
            null,
            settlementRequest,
            function (err, settlementResult1) {
              assert.isNull(err);
              assert.isTrue(settlementResult1.success);
              let settlementTransaction1 = settlementResult1.transaction;

              assert.equal(originalAmount, settlementTransaction1.amount);
              assert.isNotNull(settlementTransaction1.id);

              specHelper.defaultGateway.transaction.submitForSettlement(
                transactionId,
                null,
                settlementRequest,
                function (err, settlementResult2) {
                  assert.isNull(err);
                  assert.isTrue(settlementResult2.success);
                  let settlementTransaction2 = settlementResult2.transaction;

                  assert.equal(
                    settlementTransaction1.id,
                    settlementTransaction2.id
                  );
                  assert.equal(
                    settlementTransaction1.amount,
                    settlementTransaction2.amount
                  );

                  done();
                }
              );
            }
          );
        }
      );
    });
  });

  describe("void", function () {
    it("returns original void on duplicate request with same api request key", function (done) {
      let apiRequestKey =
        "void-idempotency-key-" + Math.floor(Math.random() * 1000000);

      let saleRequest = {
        amount: TransactionAmounts.Authorize,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
      };

      specHelper.defaultGateway.transaction.sale(
        saleRequest,
        function (err, saleResult) {
          assert.isNull(err);
          assert.isTrue(saleResult.success);
          let transactionId = saleResult.transaction.id;

          let voidRequest = {
            apiRequestKey: apiRequestKey,
          };

          specHelper.defaultGateway.transaction.void(
            transactionId,
            voidRequest,
            function (err, voidResult1) {
              assert.isNull(err);
              assert.isTrue(voidResult1.success);
              let voidedTransaction1 = voidResult1.transaction;

              assert.equal("voided", voidedTransaction1.status);

              specHelper.defaultGateway.transaction.void(
                transactionId,
                voidRequest,
                function (err, voidResult2) {
                  assert.isNull(err);
                  assert.isTrue(voidResult2.success);
                  let voidedTransaction2 = voidResult2.transaction;

                  assert.equal(voidedTransaction1.id, voidedTransaction2.id);
                  assert.equal(
                    voidedTransaction1.status,
                    voidedTransaction2.status
                  );
                  assert.equal("voided", voidedTransaction2.status);

                  done();
                }
              );
            }
          );
        }
      );
    });
  });

  describe("refund", function () {
    it("returns original refund on duplicate request with same api request key", function (done) {
      let apiRequestKey =
        "refund-idempotency-key-" + Math.floor(Math.random() * 1000000);

      let saleRequest = {
        amount: TransactionAmounts.Authorize,
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2035",
        },
        options: {
          submitForSettlement: true,
        },
      };

      specHelper.defaultGateway.transaction.sale(
        saleRequest,
        function (err, saleResult) {
          assert.isNull(err);
          assert.isTrue(saleResult.success);
          let transactionId = saleResult.transaction.id;

          specHelper.defaultGateway.testing.settle(
            transactionId,
            function (err) {
              assert.isNull(err);

              let refundRequest = {
                apiRequestKey: apiRequestKey,
              };

              specHelper.defaultGateway.transaction.refund(
                transactionId,
                refundRequest,
                function (err, refundResult1) {
                  assert.isNull(err);
                  assert.isTrue(refundResult1.success);
                  let refundTransaction1 = refundResult1.transaction;

                  assert.equal("credit", refundTransaction1.type);
                  assert.isNotNull(refundTransaction1.id);

                  specHelper.defaultGateway.transaction.refund(
                    transactionId,
                    refundRequest,
                    function (err, refundResult2) {
                      assert.isNull(err);
                      assert.isTrue(refundResult2.success);
                      let refundTransaction2 = refundResult2.transaction;

                      assert.equal(
                        refundTransaction1.id,
                        refundTransaction2.id
                      );
                      assert.equal(
                        refundTransaction1.type,
                        refundTransaction2.type
                      );

                      done();
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
});
