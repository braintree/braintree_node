require('../../spec_helper')

braintree = specHelper.braintree
{DepositDetails} = require('../../../lib/braintree/deposit_details')

describe "DepositDetails", ->
  describe "isValid", ->
    it "returns true if DepositDetails are present", (done) ->
      details = new DepositDetails
        depositDate: "2013-04-10"

      assert.equal(details.isValid(), true)
      done()

    it "returns false if DepositDetails are absent", (done) ->
      details = new DepositDetails
        depositDate: null

      assert.equal(details.isValid(), false)
      done()
