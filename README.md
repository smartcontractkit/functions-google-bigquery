# Chainlink Functions <>  Google BigQuery and Google Analytics Sample Application

This use case showcases how a developer can use Chainlink Functions together with website data collected by Google Analytics to drive and influence logic in an on-chain smart contract. For this particular example, a user is directed to a [website](https://www.dogorcat.xyz/) where they can vote for a dog or cat, with their selection being sent to [Google Analytics](https://analytics.google.com/analytics/web/). The collected data is then automatically uploaded to a dataset in [Google Cloud’s BigQuery](https://cloud.google.com/bigquery). From here, [Chainlink Automation](https://chain.link/automation) will be used to regularly call a Chainlink Function to pull the vote totals from Google BigQuery and then return them on-chain. The smart contract will use this analytics data to keep track of vote totals. Once the voting period has ended, a function in the smart contract will determine who the winner is. 

This application has been deployed and can be tested at [https://www.dogorcat.xyz/](https://www.dogorcat.xyz/)

Chainlink Functions allows users to request data from almost any API and perform custom computation using JavaScript. This project is currently in a closed beta. Request access to use Chainlink Functions at https://functions.chain.link


## Requirements

- Node.js version [18](https://nodejs.org/en/download/)
- RPC URLs for Mumbai or Sepolia networks as well as test ETH/MATIC and test LINK tokens. Get your RPC URL with API key for Sepolia or Mumbai - from [Infura](https://infura.io) or [Alchemy](https://alchemy.com). Also, get your network's token (Sepolia Eth) or [Mumbai Matic](https://faucet.polygon.technology/) and, after connecting your Metamask wallet to the right testnet, get some LINK token(faucets.link.com) into your Metamask or other browser wallet.<br><br>  You can get LINK test tokens into your wallet by going to the [LINK Faucet](https://faucets.chain.link), connecting your Metamask and requesting test LINK.

## Clone and Create Environment Variables

1. Clone this repository to your local machine<br><br>
2. Open this directory in your command line, then run `npm install` to install all dependencies.<br><br> From time to time if there an error that there is a corrupt lockfile, you can just delete the `./node_modules` folder and run `npm install` again.
3. Login to Github and head to your [settings](https://github.com/settings/tokens?type=beta) to generate a "Fine Grained Personal Access Token". Name the token, set its expiration period and then go down to **Permissions** >> "Account permissions" >> "Gists" and from the "Access" dropdown, select "Read and write". 

Scroll to the bottom of the page and click "Generate token" and copy the resulting personal access token.  
> ⚠️	⚠️	⚠️ You cannot view this token in Github after this – so make sure you paste the value <u>temporarily</u> somewhere in case you need to close this window or want to navigate away from this page

<img width="637" alt="Screenshot 2023-05-01 at 10 59 30 am" src="https://user-images.githubusercontent.com/8016129/235385875-5ff0c21c-813d-4554-8934-0f9065cc0a2e.png">


4. Environment Variables. While you may use a `.env` file, this has two security drawbacks. The file contains your secrets and keys in human-readable form, and if these are accidentially committed and pushed to your remote repo, your keys could get compromised.  So we recommend a superior, security-first approach.  This repo ships with a dependency in the `package.json` file which contains the `@chainlink/env-enc` package. This package stores your sensitive API keys and secrets in encrypted form, which means it's not human readable.  The secrets are encrypted with a password you must supply (and remember!). The file that stores the encrypted secrets is the `.env.enc` file.  Even if someone gets access to this file, without your password it is useless to them.

The environment variables you will need to have ready are:
```
PRIVATE_KEY="EVM wallet private key (Example: 6c0d*********************************************ac8da9)"
MUMBAI_RPC_URL or SEPOLIA_RPC_URL  (for the network that you intend to use)
GITHUB_API_TOKEN
```

You will also need the following additional Google Cloud Environment Variables based on the setup you have on Google Cloud BigQuery. In this case, we have two properties here that are being exported. To setup exporting of Google Analytics data to BigQuery, please see [this guide](https://support.google.com/analytics/answer/3437618?hl=en). To read more about authenticating with Google Cloud BigQuery APIs, see [this guide](https://cloud.google.com/bigquery/docs/authentication).
```
GOOGLE_PROJECT_ID="Google Cloud project ID here"
GOOGLE_PROPERTY_2="Google Analytics property ID 1 here"
GOOGLE_PROPERTY_1="Google Analytics property ID 2 here"
GOOGLE_ISS="Google Cloud service account here"
GOOGLE_KEY="-----BEGIN PRIVATE KEY-----\nGoogle Cloud private key here\n-----END PRIVATE KEY-----\n"

// Optionally
ETHERSCAN_API_KEY or POLYGONSCAN_API_KEY  (set these if you want to verify contracts)
```
<br>
If there are any other secrets that you need to pass to your custom JS code that will be executed by Chainlink DONs, and will be included in the  `secrets` object in `./Functions-request-config.js` file.


5. To set the encrypted environment variables using `env-enc`. So let's encrypt our environment variables and store them in encrypted form. But to do that we need to supply a password to encrypt the secrets and keys with :
```bash
npx env-enc set-pw
```
This command `npx env-enc set-pw`` must be run EVERY time you open or restart a terminal session, so that the encrypted secrets in your .env.enc file can be read by the package. After you set the password the first time, you must enter the identical password for the secrets to be successfully decrypted.

6. Set the encrypted values to your secrets <u>one by one</u> using the following command:
```bash
npx env-enc set
```
Doing `npx env-enc set` will initiate a UI in your terminal for you to put your env var NAME and then its corresponding value as shown here:
<img width="765" alt="Screenshot 2023-05-01 at 11 09 16 am" src="https://user-images.githubusercontent.com/8016129/235386817-dc290db7-56b9-4c5f-8f86-9d881a712f35.png">

7. When you set one or more encrypted environment variables using `env-enc`, the tool creates a `env.enc` file in your project root.  The encrypted data in the file could look like this:
<img width="659" alt="Screenshot 2023-05-01 at 11 10 58 am" src="https://user-images.githubusercontent.com/8016129/235386889-63a4d536-b0b3-4841-aa2a-411ab81be80f.png">

Remember, this `.env.enc` file can be copied and pasted into other Chainlink Functons projects but you'll need to use the `env-enc` package and you'll need to use the same password with which you encrypted these secrets.

8. When you make an on-chain request these encrypted secrets get uploaded to a private gist on your Github account, and once the Functions request is fulfilled, the gist is automatically deleted by the tool.

## Instructions to run this sample

6. Study the file `./BigQuery-API-fetch-votes.js`. If required, update the `getSQLQuery` query string to match the dataset you have setup in BigQuery.
7. Test an end-to-end request and fulfillment locally by simulating it using:<br>`npx hardhat functions-simulate --gaslimit 300000. Note that this will actually run the custom JS code in `./BigQuery-API-fetch-votes.js` and run API interactions with Google Biq Query. <br><br>
8. Deploy and verify the `./contracts/FunctionsConsumer.sol` smart contract to an actual blockchain network by running:<br>`npx hardhat functions-deploy-client --network network_name_here --verify true`<br>**Note**: Make sure *ETHERSCAN_API_KEY* or *POLYGONSCAN_API_KEY* are set if using `--verify true`, depending on which network is used.<br><br> `Network_name_here` should be replaced with the network you are deploying to (Sepolia or Mumbai) in this step, as well as all steps after this one
9. Create, fund & authorize a new Functions billing subscription by running:<br> `npx hardhat functions-sub-create --network network_name_here --amount LINK_funding_amount_here --contract 0xDeployed_client_contract_address_here`<br>**Note**: Ensure your wallet has a sufficient LINK balance before running this command.  Testnet LINK can be obtained at <a href="https://faucets.chain.link/">faucets.chain.link</a>.<br><br> A suitable amount of LINK to fund for most requests is 0.5 - 1 LINK. You should replace 0xDeployed_client_contract_address_here with your deployed contract address from the previous step.
10. Make an on-chain request by running:<br>`npx hardhat functions-request --network network_name_here --contract 0xDeployed_client_contract_address_here --subid subscription_id_number_here`, replacing subscription_id_number_here with the subscription ID you received from the previous step
11. To see what was stored on-chain from the result of the Chainlink Functions call, look for the emitted event `VoteCount` against the deployed smart contract on a blockchain explorer such as [Sepolia Etherscan](https://sepolia.etherscan.io/) or [Mumbai PolygonScan](https://mumbai.polygonscan.com/)
12. Optional: to setup automatic updating of data from BigQuery to the smart contract, follow the steps below in the Automation Integration section.

# Automation Integration

Chainlink Functions can be used with Chainlink Automation in order to automatically trigger a Functions request.

1. Create & fund a new Functions billing subscription by running:<br>`npx hardhat functions-sub-create --network network_name_here --amount LINK_funding_amount_here`<br>**Note**: Ensure your wallet has a sufficient LINK balance before running this command.<br><br>
2. Deploy the `AutomationFunctionsConsumer` client contract by running:<br>`npx hardhat functions-deploy-auto-client --network network_name_here --subid subscription_id_number_here --interval time_between_requests_here --verify true`<br>**Note**: Make sure `ETHERSCAN_API_KEY` or `POLYGONSCAN_API_KEY` environment variables are set. API keys for these services are freely available to anyone who creates an EtherScan or PolygonScan account.<br><br>
3. Register the contract for upkeep via the Chainlink Automation web app here: [https://automation.chain.link/](https://automation.chain.link/)
   - Be sure to set the `Gas limit` for the `performUpkeep` function to a high enough value.  The recommended value is 1,000,000.
   - Find further documentation for working with Chainlink Automation here: [https://docs.chain.link/chainlink-automation/introduction](https://docs.chain.link/chainlink-automation/introduction)

Once the contract is registered for upkeep, check the latest response or error with the commands `npx hardhat functions-read --network network_name_here --contract contract_address_here`.

For debugging, use the command `npx hardhat functions-check-upkeep --network network_name_here --contract contract_address_here` to see if Automation needs to call `performUpkeep`.
To manually trigger a request, use the command `npx hardhat functions-perform-upkeep --network network_name_here --contract contract_address_here`.



# Command Glossary

Each of these commands can be executed in the following format.

`npx hardhat command_here --parameter1 parameter_1_here --parameter2 parameter_2_here`

Example: `npx hardhat functions-read --network mumbai --contract 0x787Fe00416140b37B026f3605c6C72d096110Bb8`

### Functions Commands

| Command                            | Description                                                                                                      | Parameters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compile`                          | Compiles all smart contracts                                                                                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `functions-simulate`               | Simulates an end-to-end fulfillment locally for the FunctionsConsumer contract                                   | `gaslimit` (optional): Maximum amount of gas that can be used to call fulfillRequest in the client contract (defaults to 100,000 & must be less than 300,000)                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `functions-deploy-client`          | Deploys the FunctionsConsumer contract                                                                           | `network`: Name of blockchain network, `verify` (optional): Set to `true` to verify the FunctionsConsumer contract (defaults to `false`)                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `functions-request`                | Initiates a request from an FunctionsConsumer client contract from `Functions-request-config.js`                 | `network`: Name of blockchain network, `contract`: Address of the client contract to call, `subid`: Billing subscription ID used to pay for the request, `gaslimit` (optional): Maximum amount of gas that can be used to call fulfillRequest in the client contract (defaults to 100,000 & must be less than 300,000), `requestgas` (optional): Gas limit for calling the executeRequest function (defaults to 1,500,000), `simulate` (optional): Flag indicating if simulation should be run before making an on-chain request (defaults to true)                                |
| `functions-read`                   | Reads the latest response returned to a Functions client contract                                                | `network`: Name of blockchain network, `contract`: Address of the client contract to read                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `functions-read-error`             | Reads the latest error returned to a Functions client contract                                                   | `network`: Name of blockchain network, `contract`: Address of the client contract to read                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `functions-deploy-auto-client`     | Deploys the AutomatedFunctionsConsumer contract and sets Funcnction request from `Functions-request-config.js`   | `network`: Name of blockchain network, `subid`: Billing subscription ID used to pay for Functions requests, `gaslimit` (optional): Maximum amount of gas that can be used to call fulfillRequest in the client contract (defaults to 250000), `interval` (optional): Update interval in seconds for Automation to call performUpkeep (defaults to 300), `verify` (optional): Set to `true` to verify the FunctionsConsumer contract (defaults to `false`), `simulate` (optional): Flag indicating if simulation should be run before making an on-chain request (defaults to true) |
| `functions-check-upkeep`           | Checks if checkUpkeep returns true for an Automation compatible contract                                         | `network`: Name of blockchain network, `contract`: Address of the contract to check, `data` (optional): Hex string representing bytes that are passed to the checkUpkeep function (defaults to empty bytes)                                                                                                                                                                                                                                                                                                                                                                        |
| `functions-perform-upkeep`         | Manually call performUpkeep in an Automation compatible contract                                                 | `network`: Name of blockchain network, `contract`: Address of the contract to check, `data` (optional): Hex string representing bytes that are passed to the performUpkeep function (defaults to empty bytes)                                                                                                                                                                                                                                                                                                                                                                      |
| `functions-set-auto-request`       | Updates the Functions request in deployed AutomatedFunctionsConsumer contract from `Functions-request-config.js` | `network`: Name of blockchain network, `contract`: Address of the contract to update, `subid`: Billing subscription ID used to pay for Functions requests, `interval` (optional): Update interval in seconds for Automation to call performUpkeep (defaults to 300), `gaslimit` (optional): Maximum amount of gas that can be used to call fulfillRequest in the client contract (defaults to 250000)                                                                                                                                                                              |
| `functions-set-oracle-addr`        | Updates the oracle address for a client contract using the FunctionsOracle address from `network-config.js`      | `network`: Name of blockchain network, `contract`: Address of the client contract to update                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `functions-build-request`          | Creates a JSON file with Functions request parameters                                                            | `network`: Name of blockchain network, `output` (optional): Output file name (defaults to Functions-request.json), `simulate` (optional): Flag indicating if simulation should be run before building the request JSON file (defaults to true)                                                                                                                                                                                                                                                                                                                                     |
| `functions-build-offchain-secrets` | Builds an off-chain secrets object for one or many nodes that can be uploaded and referenced via URL             | `network`: Name of blockchain network, `output` (optional): Output file name (defaults to offchain-secrets.json)                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### Functions Subscription Management Commands

| Command                      | Description                                                                                                                        | Parameters                                                                                                                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `functions-sub-create`       | Creates a new billing subscription for Functions client contracts                                                                  | `network`: Name of blockchain network, `amount` (optional): Initial amount used to fund the subscription in LINK (decimals are accepted), `contract` (optional): Address of the client contract address authorized to use the new billing subscription |
| `functions-sub-info`         | Gets the Functions billing subscription balance, owner, and list of authorized client contract addresses                           | `network`: Name of blockchain network, `subid`: Subscription ID                                                                                                                                                                                        |
| `functions-sub-fund`         | Funds a billing subscription with LINK                                                                                             | `network`: Name of blockchain network, `subid`: Subscription ID, `amount`: Amount to fund subscription in LINK (decimals are accepted)                                                                                                                 |
| `functions-sub-cancel`       | Cancels Functions billing subscription and refunds unused balance. Cancellation is only possible if there are no pending requests. | `network`: Name of blockchain network, `subid`: Subscription ID, `refundaddress` (optional): Address where the remaining subscription balance is sent (defaults to caller's address)                                                                   |
| `functions-sub-add`          | Adds a client contract to the Functions billing subscription                                                                       | `network`: Name of blockchain network, `subid`: Subscription ID, `contract`: Address of the client contract to authorize for billing                                                                                                                   |
| `functions-sub-remove`       | Removes a client contract from an Functions billing subscription                                                                   | `network`: Name of blockchain network, `subid`: Subscription ID, `contract`: Address of the client contract to remove from billing subscription                                                                                                        |
| `functions-sub-transfer`     | Request ownership of an Functions subscription be transferred to a new address                                                     | `network`: Name of blockchain network, `subid`: Subscription ID, `newowner`: Address of the new owner                                                                                                                                                  |
| `functions-sub-accept`       | Accepts ownership of an Functions subscription after a transfer is requested                                                       | `network`: Name of blockchain network, `subid`: Subscription ID                                                                                                                                                                                        |
| `functions-timeout-requests` | Times out expired requests                                                                                                         | `network`: Name of blockchain network, `requestids`: 1 or more request IDs to timeout separated by commas                                                                                                                                              |

# Request Configuration

Chainlink Functions requests can be configured by modifying values in the `requestConfig` object found in the `Functions-request-config.js` file located in the root of this repository.

| Setting Name             | Description                                                                                                                                                                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codeLocation`           | This specifies where the JavaScript code for a request is located. Currently, only the `Location.Inline` option is supported (represented by the value `0`). This means the JavaScript string is provided directly in the on-chain request instead of being referenced via a URL.                                           |
| `secretsLocation`        | This specifies where the encrypted secrets for a request are located. `Location.Inline` (represented by the value `0`) means encrypted secrets are provided directly in the on-chain, while `Location.Remote` (represented by `1`) means secrets are referenced via encrypted URLs.                                         |
| `codeLanguage`           | This specifies the language of the source code which is executed in a request. Currently, only `JavaScript` is supported (represented by the value `0`).                                                                                                                                                                    |
| `source`                 | This is a string containing the source code which is executed in a request. This must be valid JavaScript code that returns a Buffer. See the [JavaScript Code](#javascript-code) section for more details.                                                                                                                 |
| `secrets`                | This is a JavaScript object which contains secret values that are injected into the JavaScript source code and can be accessed using the name `secrets`. This object will be automatically encrypted by the tooling using the DON public key before making an on-chain request. This object can only contain string values. |
| `walletPrivateKey`       | This is the EVM private key. It is used to generate a signature for the encrypted secrets such that the secrets cannot be reused by an unauthorized 3rd party.                                                                                                                                                              |
| `args`                   | This is an array of strings which contains values that are injected into the JavaScript source code and can be accessed using the name `args`. This provides a convenient way to set modifiable parameters within a request.                                                                                                |
| `expectedReturnType`     | This specifies the expected return type of a request. It has no on-chain impact, but is used by the CLI to decode the response bytes into the specified type. The options are `uint256`, `int256`, `string`, or `Buffer`.                                                                                                   |
| `secretsURLs`            | This is an array of URLs where encrypted off-chain secrets can be fetched when a request is executed if `secretsLocation` == `Location.Remote`. This array is converted into a space-separated string, encrypted using the DON public key, and used as the `secrets` parameter.                                             |
| `perNodeOffchainSecrets` | This is an array of `secrets` objects that enables the optional ability to assign a separate set of secrets for each node in the DON if `secretsLocation` == `Location.Remote`. It is used by the `functions-build-offchain-secret` command. See the [Off-chain Secrets](#off-chain-secrets) section for more details.      |
| `globalOffchainSecrets`  | This is a default `secrets` object that any DON member can use to process a request. It is used by the `functions-build-offchain-secret` command. See the [Off-chain Secrets](#off-chain-secrets) section for more details.                                                                                                 |

## JavaScript Code

The JavaScript source code for an Functions request can use vanilla Node.js features, but cannot use any imported modules or `require` statements.
It must return a JavaScript Buffer which represents the response bytes that are sent back to the requesting contract.
Encoding functions are provided in the [Functions library](#functions-library).
Additionally, the script must return in **less than 10 seconds** or it will be terminated and send back an error to the requesting contract.

In order to make HTTP requests, the source code must use the `Functions.makeHttpRequest` function from the exposed [Functions library](#functions-library).
Asynchronous code with top-level `await` statements is supported, as shown in the file `API-request-example.js`.

### Functions Library

The `Functions` library is injected into the JavaScript source code and can be accessed using the name `Functions`.

In order to make HTTP requests, only the `Functions.makeHttpRequest(x)` function can be used. All other methods of accessing the Internet are restricted.
The function takes an object `x` with the following parameters.

```
{
  url: String with the URL to which the request is sent,
  method: (optional) String specifying the HTTP method to use which can be either 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', or 'OPTIONS' (defaults to 'GET'),
  headers: (optional) Object with headers to use in the request,
  params: (optional) Object with URL query parameters,
  data: (optional) Object which represents the body sent with the request,
  timeout: (optional) Number with the maximum request duration in ms (defaults to 5000ms),
  responseType: (optional) String specifying the expected response type which can be either 'json', 'arraybuffer', 'document', 'text' or 'stream' (defaults to 'json'),
}
```

The function returns a promise that resolves to either a success response object or an error response object.

A success response object will have the following parameters.

```
{
  error: false,
  data: Response data sent by the server,
  status: Number representing the response status,
  statusText: String representing the response status,
  headers: Object with response headers sent by the server,
}
```

An error response object will have the following parameters.

```
{
  error: true,
  message: (may be undefined) String containing error message,
  code: (may be undefined) String containing an error code,
  response: (may be undefined) Object containing response from server,
}
```

This library also exposes functions for encoding JavaScript values into Buffers which represent the bytes that a returned on-chain.

- `Functions.encodeUint256(x)` takes a positive JavaScript integer number `x` and returns a 32 byte Buffer representing `x` as a `uint256` type in Solidity.
- `Functions.encodeInt256(x)` takes a JavaScript integer number `x` and returns a 32 byte Buffer representing `x` as a `int256` type in Solidity.
- `Functions.encodeString(x)` takes a JavaScript string `x` and returns a Buffer representing `x` as a `string` type in Solidity.

## Modifying Contracts

Client contracts which initiate a request and receive a fulfillment can be modified for specific use cases. The only requirements are that the client contract extends the `FunctionsClient` contract and the `fulfillRequest` callback function never uses more than 300,000 gas.

## Simulating Requests

An end-to-end request initiation and fulfillment can be simulated using the `npx hardhat functions-simulate` command. This command will report the total estimated cost of a request in LINK using the latest on-chain gas prices. Costs are based on the amount of gas used to validate the response and call the client contract's `fulfillRequest` function, plus a flat fee. Please note that actual request costs can vary based on gas prices when a request is initiated on-chain.

## Off-chain Secrets

Instead of using encrypted secrets stored directly on the blockchain, encrypted secrets can also be hosted off-chain and be fetched by DON nodes via HTTP when a request is initiated.

Off-chain secrets also enable a separate set of secrets to be assigned to each node in the DON. Each node will not be able to decrypt the set of secrets belonging to another node. Optionally, a set of default secrets encrypted with the DON public key can be used as a fallback by any DON member who does not have a set of secrets assigned to them. This handles the case where a new member is added to the DON, but the assigned secrets have not yet been updated.

To use per-node assigned secrets, enter a list of secrets objects into `perNodeOffchainSecrets` in `Functions-request-config.js` before running the `functions-build-offchain-secrets` command. The number of objects in the array must correspond to the number of nodes in the DON. Default secrets can be entered into the `globalOffchainSecrets` parameter of `Functions-request-config.js`. Each secrets object must have the same set of entries, but the values for each entry can be different (ie: `[ { apiKey: '123' }, { apiKey: '456' } ]`). If the per-node secrets feature is not desired, `perNodeOffchainSecrets` can be left empty and a single set of secrets can be entered for `globalOffchainSecrets`.

To generate the encrypted secrets JSON file, run the command `npx hardhat functions-build-offchain-secrets --network network_name_here`. This will output the file `offchain-secrets.json` which can be uploaded to S3, Github, or another hosting service that allows the JSON file to be fetched via URL.
Once the JSON file is uploaded, set `secretsLocation` to `Location.Remote` in `Functions-request-config.js` and enter the URL(s) where the JSON file is hosted into `secretsURLs`. Multiple URLs can be entered as a fallback in case any of the URLs are offline. Each URL should host the exact same JSON file. The tooling will automatically pack the secrets URL(s) into a space-separated string and encrypt the string using the DON public key so no 3rd party can view the URLs. Finally, this encrypted string of URLs is used in the `secrets` parameter when making an on-chain request.

URLs which host secrets must be available every time a request is executed by DON nodes. For optimal security, it is recommended to expire the URLs when the off-chain secrets are no longer in use.

## Disclaimer
This tutorial offers educational examples of how to use a Chainlink system, product, or service and is provided to demonstrate how to interact with Chainlink’s systems, products, and services to integrate them into your own. This template is provided “AS IS” and “AS AVAILABLE” without warranties of any kind, it has not been audited, and it may be missing key checks or error handling to make the usage of the system, product, or service more clear. Do not use the code in this example in a production environment without completing your own audits and application of best practices. Neither Chainlink Labs, the Chainlink Foundation, nor Chainlink node operators are responsible for unintended outputs that are generated due to errors in code

