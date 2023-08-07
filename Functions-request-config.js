// Use subscription ID 145 & interval 10
const fs = require("fs")

// Loads environment variables from .env file (if it exists)
require("dotenv").config()

const Location = {
  Inline: 0,
  Remote: 1,
}

const CodeLanguage = {
  JavaScript: 0,
}

const ReturnType = {
  uint: "uint256",
  uint256: "uint256",
  int: "int256",
  int256: "int256",
  string: "string",
  bytes: "Buffer",
  Buffer: "Buffer",
}

// Configure the request by setting the fields below
const requestConfig = {
  // location of source code (only Inline is currently supported)
  codeLocation: Location.Inline,
  // location of secrets (Inline or Remote)
  secretsLocation: Location.Inline,
  // code language (only JavaScript is currently supported)
  codeLanguage: CodeLanguage.JavaScript,
  // string containing the source code to be executed
  source: fs.readFileSync('./BigQuery-API-fetch-votes.js').toString(),
  // secrets can be accessed within the source code with `secrets.varName` (ie: secrets.apiKey)
  secrets: {
    key: process.env.GOOGLE_KEY,
    iss: process.env.GOOGLE_ISS,
    projectId: process.env.GOOGLE_PROJECT_ID,
    property1: process.env.GOOGLE_PROPERTY_1,
    property2: process.env.GOOGLE_PROPERTY_2,
  },
  // ETH wallet key used to sign secrets so they cannot be accessed by a 3rd party
  walletPrivateKey: process.env["PRIVATE_KEY"],
  // args (string only array) can be accessed within the source code with `args[index]` (ie: args[0]).
  args: [],
  // expected type of the returned value
  expectedReturnType: ReturnType.bytes,
  // Redundant URLs which point to encrypted off-chain secrets
  secretsURLs: [],
  // Per-node offchain secrets objects used by the `functions-build-offchain-secrets` command
  perNodeSecrets: [],
}

module.exports = requestConfig