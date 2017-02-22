'use strict';

let SignatureService = require('../../../lib/braintree/signature_service').SignatureService;

describe('SignatureService', () =>
  it('signs the data with the given key and hash', function () {
    let hashFunction = (key, data) => `${data}-hashed-with-${key}`; // eslint-disable-line func-style
    let signatureService = new SignatureService('my-key', hashFunction);
    let signed = signatureService.sign('my-data');

    assert.equal(signed, 'my-data-hashed-with-my-key|my-data');
  })
);
