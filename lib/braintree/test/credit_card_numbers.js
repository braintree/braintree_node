'use strict';

let CreditCardNumbers = {
  CardTypeIndicators: {
    Prepaid: '4111111111111210',
    Commercial: '4111111111131010',
    Payroll: '4111111114101010',
    Healthcare: '4111111510101010',
    DurbinRegulated: '4111161010101010',
    Debit: '4117101010101010',
    Unknown: '4111111111112101',
    No: '4111111111310101',
    IssuingBank: '4111111141010101',
    CountryOfIssuance: '4111111111121102',
    Fraud: '4000111111111511',
    Hiper: '6370950000000005',
    HiperCard: '6062820524845321'
  },

  AmexPayWithPoints: {
    Success: '371260714673002',
    IneligibleCard: '378267515471109',
    InsufficientPoints: '371544868764018'
  },

  Dispute: {
    Chargeback: '4023898493988028'
  }
};

module.exports = {CreditCardNumbers: CreditCardNumbers};
