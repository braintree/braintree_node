class SignatureService

  constructor: (key, hashFunction) ->
    @key = key
    @hashFunction = hashFunction

  sign: (data) ->
    "#{@hashFunction(@key, data)}|#{data}"

exports.SignatureService = SignatureService
