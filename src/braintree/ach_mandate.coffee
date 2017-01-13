{AttributeSetter} = require('./attribute_setter')

class AchMandate extends AttributeSetter
  constructor: (attributes) ->
    super attributes
    @acceptedAt = new Date(@acceptedAt)

exports.AchMandate = AchMandate
