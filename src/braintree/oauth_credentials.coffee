{AttributeSetter} = require('./attribute_setter')

class OAuthCredentials extends AttributeSetter
  constructor: (attributes) ->
    super attributes

exports.OAuthCredentials = OAuthCredentials
