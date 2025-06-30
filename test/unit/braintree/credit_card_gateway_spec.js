"use strict";

let CreditCardGateway =
  require("../../../lib/braintree/credit_card_gateway").CreditCardGateway;

describe(
  "CreditCardGateway",
  () =>
    describe("dateFormat", () =>
      it("works with a month boundary", function () {
        let gateway = new CreditCardGateway(specHelper.defaultGateway);
        let date = new Date("2016-10-1");

        assert.equal(gateway.dateFormat(date), "102016");
      })),

  describe("accountInformation", () =>
    it("processes accountInformationInquiry in creditCard options", function (done) {
      let gateway = new CreditCardGateway(specHelper.defaultGateway);
      let creditCardParams = {
        options: {
          accountInformationInquiry: "send_data",
        },
      };

      gateway.create = (params, callback) => {
        callback(null, {
          creditCard: {
            options: {
              accountInformationInquiry:
                params.options.accountInformationInquiry,
            },
          },
        });
      };

      gateway.create(creditCardParams, (err, result) => {
        assert.isNull(err);
        assert.exists(result);
        assert.deepEqual(
          result.creditCard.options.accountInformationInquiry,
          "send_data"
        );
        done();
      });
    }))
);
