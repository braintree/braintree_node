import '../../spec_helper';

let { braintree } = specHelper;
import { DisbursementDetails } from '../../../lib/braintree/disbursement_details';

describe("DisbursementDetails", () =>
  describe("isValid", function() {
    it("returns true if DisbursementDetails are present", function(done) {
      let details = new DisbursementDetails({
        disbursementDate: "2013-04-10"});

      assert.equal(details.isValid(), true);
      return done();
    });

    return it("returns false if DisbursementDetails are absent", function(done) {
      let details = new DisbursementDetails({
        disbursementDate: null});

      assert.equal(details.isValid(), false);
      return done();
    });
  })
);
