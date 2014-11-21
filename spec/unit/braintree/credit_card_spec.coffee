require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
{CreditCard} = require('../../../lib/braintree/credit_card')

describe "CreditCard", ->
  describe "constructor", ->
    it "initializes verification with the newest verification", ->
      verification1 = { id: '123', created_at: 123 }
      verification2 = { id: '987', created_at: 987 }
      verification3 = { id: '456', created_at: 456 }
      credit_card = new CreditCard({verifications: [verification1, verification2, verification3]})
      assert.equal(verification2.id, credit_card.verification.id)
