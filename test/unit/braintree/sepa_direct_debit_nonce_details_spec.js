"use strict";

let SepaDirectDebitNonceDetails =
  require("../../../lib/braintree/sepa_direct_debit_nonce_details").SepaDirectDebitNonceDetails;

describe("SepaDirectDebitNonceDetails", () =>
  it("returns the correct object", function () {
    let attributes = {
      bankReferenceToken: "a-bank-reference-token",
      correlationId: "a-correlation-id",
      ibanLastChars: "1234",
      mandateType: "ONE_OFF",
      merchantOrPartnerCustomerId: "a-mp-customer-id",
      unknownKey: "???",
    };

    const sepaDirectDebitNonceDetails = new SepaDirectDebitNonceDetails(
      attributes
    );

    assert.equal(
      sepaDirectDebitNonceDetails.bankReferenceToken,
      "a-bank-reference-token"
    );
    assert.equal(sepaDirectDebitNonceDetails.correlationId, "a-correlation-id");
    assert.equal(sepaDirectDebitNonceDetails.ibanLastChars, 1234);
    assert.equal(sepaDirectDebitNonceDetails.mandateType, "ONE_OFF");
    assert.equal(
      sepaDirectDebitNonceDetails.merchantOrPartnerCustomerId,
      "a-mp-customer-id"
    );

    assert.isUndefined(sepaDirectDebitNonceDetails.unknownKey);
  }));
