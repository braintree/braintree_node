{AttributeSetter} = require('./attribute_setter')

class AndroidPayCard extends AttributeSetter
  constructor: (attributes) ->
    super attributes

    if attributes
      @cardType = attributes.virtualCardType
      @last4 = attributes.virtualCardLast4

exports.AndroidPayCard = AndroidPayCard
