"use strict";

let PaymentInstrumentTypes =
  require("../../../lib/braintree/payment_instrument_types").PaymentInstrumentTypes;

describe("Visa Checkout", function () {
  it("can search by payment instrument type", (done) => {
    function search(search) {
      search
        .paymentInstrumentType()
        .is(PaymentInstrumentTypes.VisaCheckoutCard);

      return search;
    }

    specHelper.defaultGateway.transaction.search(
      search,
      function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.isTrue(response.length() > 0);

        done();
      }
    );
  });
});
