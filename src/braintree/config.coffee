class Config
  constructor: (rawConfig) ->
    @apiVersion = '4'
    @environment = rawConfig.environment
    @merchantId = rawConfig.merchantId || rawConfig.partnerId
    @publicKey = rawConfig.publicKey || rawConfig.clientId
    @privateKey = rawConfig.privateKey || rawConfig.clientSecret
    @baseMerchantPath = "/merchants/#{rawConfig.merchantId}"

  baseMerchantUrl: -> @environment.baseUrl() + @baseMerchantPath

exports.Config = Config
