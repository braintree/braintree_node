require('../../spec_helper')

braintree = specHelper.braintree
{DisbursementDetails} = require('../../../lib/braintree/disbursement_details')

describe "DisbursementDetails", ->
  describe "isValid", ->
    it "returns true if DisbursementDetails are present", (done) ->
      details = new DisbursementDetails
        disbursementDate: "2013-04-10"

      assert.equal(details.isValid(), true)
      done()

    it "returns false if DisbursementDetails are absent", (done) ->
      details = new DisbursementDetails
        disbursementDate: null

      assert.equal(details.isValid(), false)
      done()
