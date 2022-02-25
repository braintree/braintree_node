"use strict";

let Environment = require("./environment").Environment;

class CredentialsParser {
  parseClientCredentials(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    if (!this.clientId) {
      throw new Error("Missing clientId");
    }
    if (!this.clientSecret) {
      throw new Error("Missing clientSecret");
    }

    if (this.clientId.indexOf("client_id") !== 0) {
      throw new Error("Value passed for clientId is not a client id");
    }
    if (this.clientSecret.indexOf("client_secret") !== 0) {
      throw new Error("Value passed for clientSecret is not a client secret");
    }

    let clientIdEnvironment = this.parseEnvironment(this.clientId);
    let clientSecretEnvironment = this.parseEnvironment(this.clientSecret);

    if (clientIdEnvironment !== clientSecretEnvironment) {
      throw new Error(
        `Mismatched credential environments: clientId environment is ${clientIdEnvironment} and clientSecret environment is ${clientSecretEnvironment}`
      );
    }

    this.environment = clientIdEnvironment;

    return this.environment;
  }

  parseAccessToken(accessToken) {
    this.accessToken = accessToken;
    if (!this.accessToken) {
      throw new Error("Missing access token");
    }

    if (this.accessToken.indexOf("access_token") !== 0) {
      throw new Error(
        "Value passed for accessToken is not a valid access token"
      );
    }

    this.merchantId = this.accessToken.split("$")[2];
    this.environment = this.parseEnvironment(this.accessToken);

    return this.environment;
  }

  parseEnvironment(credential) {
    let env = credential.split("$")[1];

    switch (env) {
      case "development":
      case "integration":
        return Environment.Development;
      case "qa":
        return Environment.Qa;
      case "sandbox":
        return Environment.Sandbox;
      case "production":
        return Environment.Production;
      default:
        throw new Error(`Unknown environment: ${env}`);
    }
  }
}

module.exports = { CredentialsParser: CredentialsParser };
