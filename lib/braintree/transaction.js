"use strict";

const gatewaySymbol = Symbol();

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let ApplePayCard = require("./apple_pay_card").ApplePayCard;
let AndroidPayCard = require("./android_pay_card").AndroidPayCard;
let AuthorizationAdjustment =
  require("./authorization_adjustment").AuthorizationAdjustment;
let CreditCard = require("./credit_card").CreditCard;
let PayPalAccount = require("./paypal_account").PayPalAccount;
let PayPalHereDetails = require("./paypal_here_details").PayPalHereDetails;
let LocalPayment = require("./local_payment").LocalPayment;
let MetaCheckoutCard = require("./meta_checkout_card").MetaCheckoutCard;
let MetaCheckoutToken = require("./meta_checkout_token").MetaCheckoutToken;
let DisbursementDetails = require("./disbursement_details").DisbursementDetails;
let Dispute = require("./dispute").Dispute;
let FacilitatedDetails = require("./facilitated_details").FacilitatedDetails;
let FacilitatorDetails = require("./facilitator_details").FacilitatorDetails;
let RiskData = require("./risk_data").RiskData;
let SepaDirectDebitAccountDetails =
  require("./sepa_direct_debit_account_details").SepaDirectDebitAccountDetails;
let Packages = require("./packages").Packages;
let ThreeDSecureInfo = require("./three_d_secure_info").ThreeDSecureInfo;
let UsBankAccount = require("./us_bank_account").UsBankAccount;
let VenmoAccountDetails =
  require("./venmo_account_details").VenmoAccountDetails;
let VisaCheckoutCard = require("./visa_checkout_card").VisaCheckoutCard;
let SamsungPayCard = require("./samsung_pay_card").SamsungPayCard;
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class Transaction extends AttributeSetter {
  static initClass() {
    this.CreatedUsing = {
      FullInformation: "full_information",
      Token: "token",
    };

    this.EscrowStatus = {
      HoldPending: "hold_pending",
      Held: "held",
      ReleasePending: "release_pending",
      Released: "released",
      Refunded: "refunded",
    };

    this.Source = {
      Api: "api",
      ControlPanel: "control_panel",
      Recurring: "recurring",
    };

    this.Type = {
      Credit: "credit",
      Sale: "sale",
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== "All") {
            all.push(value);
          }
        }

        return all;
      },
    };

    this.GatewayRejectionReason = {
      ApplicationIncomplete: "application_incomplete",
      Avs: "avs",
      Cvv: "cvv",
      AvsAndCvv: "avs_and_cvv",
      Duplicate: "duplicate",
      Fraud: "fraud",
      RiskThreshold: "risk_threshold",
      ThreeDSecure: "three_d_secure",
      TokenIssuance: "token_issuance",
    };

    this.IndustryData = {
      Lodging: "lodging",
      TravelAndCruise: "travel_cruise",
      TravelAndFlight: "travel_flight",
    };

    this.AdditionalCharge = {
      Restaurant: "restaurant",
      GiftShop: "gift_shop",
      MiniBar: "mini_bar",
      Telephone: "telephone",
      Laundry: "laundry",
      Other: "other",
    };

    this.Status = {
      AuthorizationExpired: "authorization_expired",
      Authorizing: "authorizing",
      Authorized: "authorized",
      GatewayRejected: "gateway_rejected",
      Failed: "failed",
      ProcessorDeclined: "processor_declined",
      Settled: "settled",
      Settling: "settling",
      SettlementConfirmed: "settlement_confirmed",
      SettlementDeclined: "settlement_declined",
      SettlementPending: "settlement_pending",
      SubmittedForSettlement: "submitted_for_settlement",
      Voided: "voided",
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== "All") {
            all.push(value);
          }
        }

        return all;
      },
    };

    this.ExternalVault = {
      WillVault: "will_vault",
      Vaulted: "vaulted",
    };

    this.ReasonCode = {
      Any: "any_reason_code",
    };
  }

  constructor(attributes, passedInGateway) {
    super(attributes);

    this.creditCard = new CreditCard(attributes.creditCard);
    this.paypalAccount = new PayPalAccount(attributes.paypal);
    this.paypalHereDetails = new PayPalHereDetails(attributes.paypalHere);
    this.localPayment = new LocalPayment(attributes.localPayment);
    this.applePayCard = new ApplePayCard(attributes.applePay);
    // NEXT_MAJOR_VERSION rename Android Pay to Google Pay
    this.androidPayCard = new AndroidPayCard(attributes.androidPayCard);
    this.disbursementDetails = new DisbursementDetails(
      attributes.disbursementDetails
    );
    this.visaCheckoutCard = new VisaCheckoutCard(attributes.visaCheckoutCard);
    this.samsungPayCard = new SamsungPayCard(attributes.samsungPayCard);
    if (attributes.metaCheckoutCard) {
      this.metaCheckoutCard = new MetaCheckoutCard(attributes.metaCheckoutCard);
    }
    if (attributes.metaCheckoutToken) {
      this.metaCheckoutToken = new MetaCheckoutToken(
        attributes.metaCheckoutToken
      );
    }
    if (attributes.sepaDebitAccountDetail) {
      this.sepaDirectDebitAccountDetails = new SepaDirectDebitAccountDetails(
        attributes.sepaDebitAccountDetail
      );
    }
    if (attributes.disputes != null) {
      this.disputes = attributes.disputes.map(
        (disputeAttributes) => new Dispute(disputeAttributes)
      );
    }
    if (attributes.facilitatedDetails) {
      this.facilitatedDetails = new FacilitatedDetails(
        attributes.facilitatedDetails
      );
    }
    if (attributes.facilitatorDetails) {
      this.facilitatorDetails = new FacilitatorDetails(
        attributes.facilitatorDetails
      );
    }
    if (attributes.shipments) {
      this.packages = new Packages(attributes.shipments);
    }
    if (attributes.riskData) {
      this.riskData = new RiskData(attributes.riskData);
    }
    if (attributes.threeDSecureInfo) {
      this.threeDSecureInfo = new ThreeDSecureInfo(attributes.threeDSecureInfo);
    }
    if (attributes.usBankAccount) {
      this.usBankAccount = new UsBankAccount(attributes.usBankAccount);
    }
    if (attributes.authorizationAdjustments) {
      this.authorizationAdjustments = attributes.authorizationAdjustments.map(
        (authorizationAdjustmentAttributes) =>
          new AuthorizationAdjustment(authorizationAdjustmentAttributes)
      );
    }
    if (attributes.venmoAccount) {
      this.venmoAccountDetails = new VenmoAccountDetails(
        attributes.venmoAccount
      );
    }

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

module.exports = { Transaction: wrapPrototype(Transaction, {}) };
