class Config
  constructor: (rawConfig) ->
    @apiVersion = '3'
    @environment = rawConfig.environment
    @merchantId = rawConfig.merchantId || rawConfig.partnerId
    @publicKey = rawConfig.publicKey
    @privateKey = rawConfig.privateKey
    @baseMerchantPath = "/merchants/#{rawConfig.merchantId}"

  baseMerchantUrl: -> @environment.baseUrl() + @baseMerchantPath

exports.Config = Config
