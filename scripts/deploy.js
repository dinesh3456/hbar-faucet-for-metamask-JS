// deployAudioContract.js
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  ContractCreateFlow,
} = require("@hashgraph/sdk");
const fs = require("fs");

const operatorId = AccountId.fromString(process.env.REACT_APP_MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromStringECDSA(process.env.REACT_APP_MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function deployAudioContract() {
  const contractBytecode = fs.readFileSync("scripts/Audio_sol_Audio.bin");

  const contractCreateTx = new ContractCreateFlow()
    .setBytecode(contractBytecode)
    .setGas(10000000); // Set gas limit accordingly

  const contractCreateSubmit = await contractCreateTx.execute(client);
  const contractCreateRx = await contractCreateSubmit.getReceipt(client);
  const contractId = contractCreateRx.contractId;
  const contractAddress = contractId.toSolidityAddress();

  console.log(`- The Audio smart contract ID is: ${contractId} \n`);
  console.log(`- Smart contract ID in Solidity format: ${contractAddress} \n`);

  return contractId;
}

deployAudioContract();
