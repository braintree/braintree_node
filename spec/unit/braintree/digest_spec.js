require('../../spec_helper');
let { Digest } = require('../../../lib/braintree/digest');

describe("Util", function() {
  describe("Sha1hexdigest", function() {
    it("passes test case 6 from RFC 2202", function() {
      let digest = Digest.Sha1hexdigest(specHelper.multiplyString("\xaa", 80), "Test Using Larger Than Block-Size Key - Hash Key First");
      return assert.equal(digest, "aa4ae5e15272d00e95705637ce8a3b55ed402112");
    });

    return it("passes test case 7 from RFC 2202", function() {
      let digest = Digest.Sha1hexdigest(specHelper.multiplyString("\xaa", 80), "Test Using Larger Than Block-Size Key and Larger Than One Block-Size Data");
      return assert.equal(digest, 'e8e99d0f45237d786d6bbaa7965c7808bbff1a91');
    });
  });

  describe("hmacSha256", () =>
    it("is the HMAC SHA256", function() {
      let hmac = Digest.Sha256hexdigest("my-secret-key", "my-secret-message");
      return assert.equal(hmac, "c6d0dfae32b8ed2d02b236e9ee2be05478e69b8d72ff82d64ce1f25e2c6d4066");
    })
  );

  return describe("secureCompare", function() {
    it("returns true if strings are the same", () => assert(new Digest().secureCompare("a_string", "a_string")));

    it("returns false if strings are different lengths", () => assert.strictEqual(false, new Digest().secureCompare("a_string", "a_string_that_is_longer")));

    return it("returns false if strings are different", () => assert.strictEqual(false, new Digest().secureCompare("a_string", "a_strong")));
  });
});
