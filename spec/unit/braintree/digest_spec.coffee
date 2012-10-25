require('../../spec_helper')
{Digest} = require('../../../lib/braintree/digest')

describe "Uti", ->
  describe "hexdigest", ->
    it "passes test case 6 from RFC 2202", ->
      digest = Digest.hexdigest(specHelper.multiplyString("\xaa", 80), "Test Using Larger Than Block-Size Key - Hash Key First")
      assert.equal(digest, "aa4ae5e15272d00e95705637ce8a3b55ed402112")

    it "passes test case 7 from RFC 2202", ->
      digest = Digest.hexdigest(specHelper.multiplyString("\xaa", 80), "Test Using Larger Than Block-Size Key and Larger Than One Block-Size Data")
      assert.equal(digest, 'e8e99d0f45237d786d6bbaa7965c7808bbff1a91')
