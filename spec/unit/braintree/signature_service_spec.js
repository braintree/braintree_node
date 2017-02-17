'use strict';

require('../../spec_helper');
let SignatureService = require('../../../lib/braintree/signature_service').SignatureService;

describe("SignatureService", () =>
  it("signs the data with the given key and hash", function() {
    let hashFunction = (key, data) => `${data}-hashed-with-${key}`;
    let signatureService = new SignatureService("my-key", hashFunction);
    let signed = signatureService.sign("my-data");
    return assert.equal(signed, "my-data-hashed-with-my-key|my-data");
  })
);
