'use strict';

const gatewaySymbol = Symbol();

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let ApplePayCard = require('./apple_pay_card').ApplePayCard;
let AndroidPayCard = require('./android_pay_card').AndroidPayCard;
let AuthorizationAdjustment = require('./authorization_adjustment').AuthorizationAdjustment;
let CreditCard = require('./credit_card').CreditCard;
let PayPalAccount = require('./paypal_account').PayPalAccount;
let LocalPayment = require('./local_payment').LocalPayment;
let CoinbaseAccount = require('./coinbase_account').CoinbaseAccount;
let DisbursementDetails = require('./disbursement_details').DisbursementDetails;
let Dispute = require('./dispute').Dispute;
let FacilitatedDetails = require('./facilitated_details').FacilitatedDetails;
let FacilitatorDetails = require('./facilitator_details').FacilitatorDetails;
let RiskData = require('./risk_data').RiskData;
let ThreeDSecureInfo = require('./three_d_secure_info').ThreeDSecureInfo;
let UsBankAccount = require('./us_bank_account').UsBankAccount;
// NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
// DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.
let IdealPayment = require('./ideal_payment').IdealPayment;
let VisaCheckoutCard = require('./visa_checkout_card').VisaCheckoutCard;
let MasterpassCard = require('./masterpass_card').MasterpassCard;
let SamsungPayCard = require('./samsung_pay_card').SamsungPayCard;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

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
      TravelAndCruise: 'travel_cruise',
      TravelAndFlight: 'travel_flight'
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

    this.ExternalVault = {
      WillVault: 'will_vault',
      Vaulted: 'vaulted'
    };
  }

  constructor(attributes, passedInGateway) {
    super(attributes);

    this.creditCard = new CreditCard(attributes.creditCard);
    this.paypalAccount = new PayPalAccount(attributes.paypal);
    this.localPayment = new LocalPayment(attributes.localPayment);
    this.coinbaseAccount = new CoinbaseAccount(attributes.coinbaseAccount);
    this.applePayCard = new ApplePayCard(attributes.applePay);
    this.androidPayCard = new AndroidPayCard(attributes.androidPayCard);
    this.disbursementDetails = new DisbursementDetails(attributes.disbursementDetails);
    this.visaCheckoutCard = new VisaCheckoutCard(attributes.visaCheckoutCard);
    this.masterpassCard = new MasterpassCard(attributes.masterpassCard);
    this.samsungPayCard = new SamsungPayCard(attributes.samsungPayCard);
    if (attributes.disputes != null) { this.disputes = attributes.disputes.map((disputeAttributes) => new Dispute(disputeAttributes)); }
    if (attributes.facilitatedDetails) { this.facilitatedDetails = new FacilitatedDetails(attributes.facilitatedDetails); }
    if (attributes.facilitatorDetails) { this.facilitatorDetails = new FacilitatorDetails(attributes.facilitatorDetails); }
    if (attributes.riskData) { this.riskData = new RiskData(attributes.riskData); }
    if (attributes.threeDSecureInfo) { this.threeDSecureInfo = new ThreeDSecureInfo(attributes.threeDSecureInfo); }
    if (attributes.usBankAccount) { this.usBankAccount = new UsBankAccount(attributes.usBankAccount); }
    // NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
    // DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.
    if (attributes.idealPayment) { this.idealPaymentDetails = new IdealPayment(attributes.idealPayment); }
    if (attributes.authorizationAdjustments) { this.authorizationAdjustments = attributes.authorizationAdjustments.map((authorizationAdjustmentAttributes) => new AuthorizationAdjustment(authorizationAdjustmentAttributes)); }

    this[gatewaySymbol] = passedInGateway;
  }

  isDisbursed() {
    return this.disbursementDetails.isValid();
  }

  lineItems() {
    return this[gatewaySymbol].transactionLineItem.findAll(this.id);
  }
}
Transaction.initClass();

module.exports = {Transaction: wrapPrototype(Transaction, {})};
