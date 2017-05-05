'use strict';
/* eslint-disable camelcase */

let CreditCard = require('../../../lib/braintree/credit_card').CreditCard;

describe('CreditCard', () =>
  describe('constructor', () =>
    it('initializes verification with the newest verification', function () {
      let verification1 = {id: '123', created_at: 123};
      let verification2 = {id: '987', created_at: 987};
      let verification3 = {id: '456', created_at: 456};
      let credit_card = new CreditCard({verifications: [verification1, verification2, verification3]});

      assert.equal(verification2.id, credit_card.verification.id);
    })
  )
);
