'use strict';

const OAuthAccessRevocation = require('../../../lib/braintree/oauth_access_revocation').OAuthAccessRevocation;

describe('OAuthAccessRevocation', () => {
  it('assigns a merchantId property', () => {
    const revocation = new OAuthAccessRevocation({merchantId: 'abc123xyz'});

    assert.equal(revocation.merchantId, 'abc123xyz');
  });
});
