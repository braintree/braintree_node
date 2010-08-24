var Config = function (rawConfig) {
  return {
    environment: rawConfig.environment,
    merchant_id: rawConfig.merchantId,
    public_key: rawConfig.publicKey,
    private_key: rawConfig.privateKey,
    baseMerchantPath: '/merchants/' + rawConfig.merchantId
  };
};

exports.Config = Config;
