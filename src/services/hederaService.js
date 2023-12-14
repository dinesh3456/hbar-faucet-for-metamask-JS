// hederaService.js
import { Client,ContractId,ContractExecuteTransaction,AccountId, PrivateKey , ContractCallQuery, Hbar  } from "@hashgraph/sdk";
import { REACT_APP_MY_ACCOUNT_ID, REACT_APP_MY_PRIVATE_KEY } from '../config';

const REACT_APP_CONTRACT_ID = "0.0.6770770";

// Initialize the Hedera client with operator account ID and private key
const operatorAccountId = AccountId.fromString(REACT_APP_MY_ACCOUNT_ID);
const operatorPrivateKey = PrivateKey.fromStringECDSA(REACT_APP_MY_PRIVATE_KEY);

const client = Client.forTestnet(); // or Client.forMainnet()
client.setOperator(operatorAccountId, operatorPrivateKey);

// Function to fetch the audio URL from the smart contract
export async function getAudioUrlFromContract(audioId) {
  try {
    // Use ContractCallQuery to get the audio URL
    const response = await new ContractCallQuery()
      .setContractId(REACT_APP_CONTRACT_ID)
      .setGas(100000) // Set gas limit accordingly
      .setFunction("getAudioUrl")
      .addString(audioId.toString())
      .execute(client);

    const audioUrl = response.getString(0);
    return audioUrl;
  } catch (error) {
    console.error("Error fetching audio URL:", error);
    return null;
  }
}

// Function to make the payment and grant access
export async function payWithHBAR(audioId, client) {
  try {
    // Get contract info
    const audioContract = ContractId.fromString(REACT_APP_CONTRACT_ID);

    // Set the payment amount (adjust this value based on your requirements)
    const paymentAmount = Hbar.fromTinybars(100000); // Example: 0.0001 HBAR




    // Make the payment to the smart contract
    const transactionResponse = await new ContractExecuteTransaction()
      .setContractId(audioContract)
      .setGas(1000000)
      .setFunction("payToListen")
      .setPayableAmount(paymentAmount) // Set the payment amount
      .execute(client);


    console.log("Transaction Response:", transactionResponse);

    // Wait for the transaction receipt
    const transactionReceipt = await transactionResponse.getReceipt(client);
    console.log("Transaction Receipt:", transactionReceipt);

  
    // Check the transaction status from the receipt
    const status = transactionReceipt.Result || "UNKNOWN";
    console.log("Transaction Status:", status);

    const logs = transactionReceipt.logs;
    console.log("Contract Logs:", logs);

    if (status === "_code: 22"|| status === "UNKNOWN") {
      // Check the payment status after the transaction
      const hasAccessResponse = await new ContractCallQuery()
        .setContractId(audioContract)
        .setGas(1000000) // Increase gas limit
        .setFunction("getHasAccess")
        .execute(client);

      const hasAccess = hasAccessResponse.getBoolean(0);

      return hasAccess;
    } else {
      console.error("Transaction failed with status:", status);
      return false;
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return false;
  }
}
// Function to enable audio controls after a successful payment
export async function enableAudioControls(audioId) {
  const audioElement = document.getElementById(`audio-${audioId}`);
  const payButton = document.getElementById(`pay-button-${audioId}`);

  if (audioElement && payButton) {
    const audioContract = await client.getContractRecord(
      process.env.REACT_APP_CONTRACT_ID
    );

    const hasAccess = await audioContract.callLocal(
      {
        function: "hasAccess",
        args: [client.operatorAccountId.toString()],
      },
      new Hbar(1)
    );

    const hasListened =
      audioElement.getAttribute("data-has-listened") === "true";

    if (hasAccess) {
      audioElement.controls = true;
      payButton.textContent = "Paid";
      payButton.disabled = true;

      if (!hasListened) {
        audioElement.setAttribute("data-has-listened", "true");

        audioElement.addEventListener("ended", () => {
          audioElement.controls = false;
          payButton.textContent = "Pay to listen again";
          payButton.disabled = false;
        });
      }
    } else {
      audioElement.controls = false;
      payButton.textContent = "Pay to listen again";
      payButton.disabled = false;
    }
  } else {
    console.error("Audio controls not found for audioId:", audioId);
  }
}
