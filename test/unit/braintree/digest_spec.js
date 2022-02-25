"use strict";

let Digest = require("../../../lib/braintree/digest").Digest;

describe("Util", function () {
  describe("Sha1hexdigest", function () {
    it("passes test case 6 from RFC 2202", function () {
      let digest = Digest.Sha1hexdigest(
        specHelper.multiplyString("\xaa", 80),
        "Test Using Larger Than Block-Size Key - Hash Key First"
      );

      assert.equal(digest, "aa4ae5e15272d00e95705637ce8a3b55ed402112");
    });

    it("passes test case 7 from RFC 2202", function () {
      let digest = Digest.Sha1hexdigest(
        specHelper.multiplyString("\xaa", 80),
        "Test Using Larger Than Block-Size Key and Larger Than One Block-Size Data"
      );

      assert.equal(digest, "e8e99d0f45237d786d6bbaa7965c7808bbff1a91");
    });
  });

  describe("secureCompare", function () {
    it("returns true if strings are the same", () =>
      assert(new Digest().secureCompare("a_string", "a_string")));

    it("returns false if strings are different lengths", () =>
      assert.strictEqual(
        false,
        new Digest().secureCompare("a_string", "a_string_that_is_longer")
      ));

    it("returns false if strings are different", () =>
      assert.strictEqual(
        false,
        new Digest().secureCompare("a_string", "a_strong")
      ));
  });
});
