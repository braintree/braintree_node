"use strict";

let Disbursement = require("../../../lib/braintree/disbursement").Disbursement;

describe("DisbursementGateway", () =>
  describe("#transactions", () =>
    it("retrieves transactions associated with the disbursement", function (done) {
      let disbursementParams = {
        id: "123456",
        merchantAccount: {
          id: "ma_card_processor_brazil",
          status: "active",
        },
        transactionIds: ["transaction_with_installments_and_adjustments"],
        amount: "100.00",
        disbursementDate: "2013-04-10",
        exceptionMessage: "invalid_account_number",
        followUpAction: "update",
        retry: false,
        success: false,
      };

      let disbursement = new Disbursement(disbursementParams);

      specHelper.defaultGateway.disbursement.transactions(
        disbursement,
        function (err, transactions) {
          assert.isNull(err);
          assert.equal(transactions.length(), 1);

          return transactions.first(function (err, transaction) {
            assert.isNull(err);
            assert.equal(
              transaction.id,
              "transaction_with_installments_and_adjustments"
            );
            done();
          });
        }
      );
    })));
