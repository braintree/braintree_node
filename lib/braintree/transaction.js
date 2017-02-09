'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let ApplePayCard = require('./apple_pay_card').ApplePayCard;
let AndroidPayCard = require('./android_pay_card').AndroidPayCard;
let CreditCard = require('./credit_card').CreditCard;
let PayPalAccount = require('./paypal_account').PayPalAccount;
let CoinbaseAccount = require('./coinbase_account').CoinbaseAccount;
let DisbursementDetails = require('./disbursement_details').DisbursementDetails;
let Dispute = require('./dispute').Dispute;
let FacilitatorDetails = require('./facilitator_details').FacilitatorDetails;
let RiskData = require('./risk_data').RiskData;
let ThreeDSecureInfo = require('./three_d_secure_info').ThreeDSecureInfo;
let UsBankAccount = require('./us_bank_account').UsBankAccount;

class Transaction extends AttributeSetter {
  static initClass() {
    this.CreatedUsing = {
      FullInformation: 'full_information',
      Token: 'token'
    };

    this.EscrowStatus = {
      HoldPending: 'hold_pending',
      Held: 'held',
      ReleasePending: 'release_pending',
      Released: 'released',
      Refunded: 'refunded'
    };

    this.Source = {
      Api: 'api',
      ControlPanel: 'control_panel',
      Recurring: 'recurring'
    };

    this.Type = {
      Credit: 'credit',
      Sale: 'sale',
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== 'All') { all.push(value); }
        }
        return all;
      }
    };

    this.GatewayRejectionReason = {
      ApplicationIncomplete: 'application_incomplete',
      Avs: 'avs',
      Cvv: 'cvv',
      AvsAndCvv: 'avs_and_cvv',
      Duplicate: 'duplicate',
      Fraud: 'fraud',
      ThreeDSecure: 'three_d_secure'
    };

    this.IndustryData = {
      Lodging: 'lodging',
      TravelAndCruise: 'travel_cruise'
    };

    this.Status = {
      AuthorizationExpired: 'authorization_expired',
      Authorizing: 'authorizing',
      Authorized: 'authorized',
      GatewayRejected: 'gateway_rejected',
      Failed: 'failed',
      ProcessorDeclined: 'processor_declined',
      Settled: 'settled',
      Settling: 'settling',
      SettlementConfirmed: 'settlement_confirmed',
      SettlementDeclined: 'settlement_declined',
      SettlementPending: 'settlement_pending',
      SubmittedForSettlement: 'submitted_for_settlement',
      Voided: 'voided',
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== 'All') { all.push(value); }
        }
        return all;
      }
    };
  }

  constructor(attributes) {
    super(attributes);
    this.creditCard = new CreditCard(attributes.creditCard);
    this.paypalAccount = new PayPalAccount(attributes.paypal);
    this.coinbaseAccount = new CoinbaseAccount(attributes.coinbaseAccount);
    this.applePayCard = new ApplePayCard(attributes.applePay);
    this.androidPayCard = new AndroidPayCard(attributes.androidPayCard);
    this.disbursementDetails = new DisbursementDetails(attributes.disbursementDetails);
    if (attributes.disputes != null) { this.disputes = attributes.disputes.map((disputeAttributes) => new Dispute(disputeAttributes)); }
    if (attributes.facilitatorDetails) { this.facilitatorDetails = new FacilitatorDetails(attributes.facilitatorDetails); }
    if (attributes.riskData) { this.riskData = new RiskData(attributes.riskData); }
    if (attributes.threeDSecureInfo) { this.threeDSecureInfo = new ThreeDSecureInfo(attributes.threeDSecureInfo); }
    if (attributes.usBankAccount) { this.usBankAccount = new UsBankAccount(attributes.usBankAccount); }
  }

  isDisbursed() {
    return this.disbursementDetails.isValid();
  }
}
Transaction.initClass();

module.exports = {Transaction: Transaction};
