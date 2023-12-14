import { REACT_APP_MY_ACCOUNT_ID, REACT_APP_MY_PRIVATE_KEY } from './config';
import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";
//import { GlobalAppContext } from "./contexts/GlobalAppContext";
import React, { useState } from "react";
import {
  payWithHBAR,
  enableAudioControls,
} from "./services/hederaService";

function AudioComponent({ audioId, audioSrc, client }) {
  const [hasPaid, setHasPaid] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handlePayWithHBAR = async () => {
    if (hasPaid) {
      alert("You have already paid for this audio. Enjoy!");
      return;
    }

    try {
      const success = await payWithHBAR(audioId, client);

      if (success) {
        enableAudioControls(audioId);
        alert("Payment successful! Enjoy the audio.");

        setHasPaid(true);
        setShowControls(true);

        const audioElement = document.getElementById(`audio-${audioId}`);
        if (audioElement) {
          audioElement.addEventListener("ended", () => {
            setShowControls(false);
          });
        }
      } else {
        console.error("Payment not successful.");
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="audio-item">
      <h3>Audio Player {audioId}</h3>
      <button
        className="pay-button"
        id={`pay-button-${audioId}`}
        onClick={handlePayWithHBAR}
      >
        {hasPaid ? "Already Paid" : "Pay with HBAR"}
      </button>
      <audio id={`audio-${audioId}`} controls={showControls} data-has-listened="false">
        <source src={audioSrc} type="audio/mp3" />
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
}

function YourComponent() {
  const audioData = [
    {
      id: 1,
      src: "https://gateway.pinata.cloud/ipfs/QmYd6QqjAsf1BPGijq4kAmuVXPBbvDRWqyprRdAPzLcXpa",
    },
    {
      id: 2,
      src: "https://gateway.pinata.cloud/ipfs/QmexfW4Vu6qvgudCSjDjPqTAv1ZYjLDrkDsYBeUtdNxkhE",
    },
    {
      id: 3,
      src: "https://gateway.pinata.cloud/ipfs/QmTApCdTVWddkLkJ8PCHADNjDUvcpj1hMhHzTULs3V1CTe",
    },
    {
      id: 4,
      src: "https://gateway.pinata.cloud/ipfs/QmTskujoRo3wiqN1BGsB111aRebdENNgNjJrWwAK6W6FPL",
    },
  ];

  const myAccountId = AccountId.fromString(REACT_APP_MY_ACCOUNT_ID);
  const myPrivateKey = PrivateKey.fromStringECDSA(REACT_APP_MY_PRIVATE_KEY);

  if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables REACT_APP_MY_ACCOUNT_ID and REACT_APP_MY_PRIVATE_KEY must be present");
  }

  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);

  return (
    <div className="audio-row">
      {audioData.map(({ id, src }) => (
        <AudioComponent key={id} audioId={id} audioSrc={src} client={client} />
      ))}
    </div>
  );
}

export default YourComponent;
