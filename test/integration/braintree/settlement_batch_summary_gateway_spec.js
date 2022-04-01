"use strict";

describe("SettlementBatchSummaryGateway", () =>
  describe("generate", function () {
    it("creates a batch with no records", (done) =>
      specHelper.defaultGateway.settlementBatchSummary.generate(
        { settlementDate: "2011-01-01" },
        function (err, response) {
          assert.isTrue(response.success);
          assert.deepEqual(response.settlementBatchSummary.records, []);

          done();
        }
      ));

    it("returns an error if the date cannot be parsed", (done) =>
      specHelper.defaultGateway.settlementBatchSummary.generate(
        { settlementDate: "NOT A DATE" },
        function (err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors
              .for("settlementBatchSummary")
              .on("settlementDate")[0].code,
            "82302"
          );
          assert.equal(
            response.errors
              .for("settlementBatchSummary")
              .on("settlementDate")[0].attribute,
            "settlement_date"
          );

          done();
        }
      ));

    it("creates a settlement batch with the appropriate records", function (done) {
      let transactionParams = {
        amount: "5.00",
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/12",
        },
      };

      specHelper.defaultGateway.transaction.credit(
        transactionParams,
        (err, transactionResponse) =>
          specHelper.defaultGateway.testing.settle(
            transactionResponse.transaction.id,
            function () {
              let settlementDateInEastern = specHelper.settlementDate(
                new Date()
              );
              let formattedDate = specHelper.dateToMdy(settlementDateInEastern);

              specHelper.defaultGateway.settlementBatchSummary.generate(
                { settlementDate: formattedDate },
                function (err, settleBatchResponse) {
                  assert.isTrue(settleBatchResponse.success);

                  let visaRecords = Array.from(
                    settleBatchResponse.settlementBatchSummary.records
                  )
                    .filter((record) => record.cardType === "Visa")
                    .map((record) => record);

                  assert.ok(visaRecords[0].count >= 1);
                  assert.ok(
                    parseFloat(visaRecords[0].amountSettled) >=
                      parseFloat("5.00")
                  );

                  done();
                }
              );
            }
          )
      );
    });

    it("groups by custom field", function (done) {
      let transactionParams = {
        amount: "5.00",
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/12",
        },
        customFields: {
          storeMe: 1,
        },
      };

      specHelper.defaultGateway.transaction.credit(
        transactionParams,
        (err, transactionResponse) =>
          specHelper.defaultGateway.testing.settle(
            transactionResponse.transaction.id,
            function () {
              let settlementDateInEastern = specHelper.settlementDate(
                new Date()
              );
              let formattedDate = specHelper.dateToMdy(settlementDateInEastern);
              let settlementBatchParams = {
                settlementDate: formattedDate,
                groupByCustomField: "store_me",
              };

              specHelper.defaultGateway.settlementBatchSummary.generate(
                settlementBatchParams,
                function (err, settleBatchResponse) {
                  assert.isTrue(settleBatchResponse.success);
                  let records =
                    settleBatchResponse.settlementBatchSummary.records;

                  assert.ok(records[0].store_me); // eslint-disable-line camelcase

                  done();
                }
              );
            }
          )
      );
    });
  }));
