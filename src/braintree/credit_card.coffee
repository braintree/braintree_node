{AttributeSetter} = require('./attribute_setter')
{CreditCardVerification} = require('./credit_card_verification')

class CreditCard extends AttributeSetter
  @CardType =
    AmEx : "American Express"
    CarteBlanche : "Carte Blanche"
    ChinaUnionPay : "China UnionPay"
    DinersClubInternational : "Diners Club"
    Discover : "Discover"
    JCB : "JCB"
    Laser : "Laser"
    Maestro : "Maestro"
    MasterCard : "MasterCard"
    Solo : "Solo"
    Switch : "Switch"
    Visa : "Visa"
    Unknown : "Unknown"
    All : ->
      all = []
      for key, value of @
        all.push value if key isnt 'All'
      all
  @CustomerLocation =
    International : 'international'
    US : 'us'

  @CardTypeIndicator =
    Yes : "Yes"
    No : "No"
    Unknown : "Unknown"

  @Prepaid = @Commercial = @Payroll = @Healthcare = @DurbinRegulated =
    @Debit = @CountryOfIssuance = @IssuingBank = @CardTypeIndicator

  constructor: (attributes) ->
    super attributes
    @maskedNumber = "#{@bin}******#{@last4}"
    @expirationDate = "#{@expirationMonth}/#{@expirationYear}"
    if attributes
      sorted_verifications = (attributes.verifications || []).sort (a, b) -> b.created_at - a.created_at
      @verification = new CreditCardVerification(sorted_verifications[0]) if sorted_verifications[0]

exports.CreditCard = CreditCard
