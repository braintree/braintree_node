'use strict';

require('../../spec_helper');

let braintree = specHelper.braintree;
let Disbursement = require('../../../lib/braintree/disbursement').Disbursement;

describe("DisbursementGateway", () =>
  describe("#transactions", () =>
    it("retrieves transactions associated with the disbursement", function(done) {
      let disbursementParams = {
        id: "123456",
        merchantAccount: {
          id: "sandbox_sub_merchant_account",
          masterMerchantAccount: {
            id: "sandbox_master_merchant_account",
            status: "active"
          },
          status: "active"
        },
        transactionIds: ["sub_merchant_transaction"],
        amount: "100.00",
        disbursementDate: "2013-04-10",
        exceptionMessage: "invalid_account_number",
        followUpAction: "update",
        retry: false,
        success: false
      };

      let disbursement = new Disbursement(disbursementParams);

      return specHelper.defaultGateway.disbursement.transactions(disbursement, function(err, transactions) {
        assert.isNull(err);
        assert.equal(transactions.length(), 1);
        return transactions.first(function(err, transaction) {
          assert.isNull(err);
          assert.equal(transaction.id, "sub_merchant_transaction");
          return done();});
      });
    })
  )
);
