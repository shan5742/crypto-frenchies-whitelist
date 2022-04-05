import React from "react";
import styles from "../styles/Home.module.css";

export default function ButtonComponent({
  walletConnected,
  joinedWhitelist,
  addAddressToWhitelist,
  connectWallet,
  loading,
}) {
  if (walletConnected) {
    if (joinedWhitelist) {
      return (
        <div className={styles.description}>
          You're in! Thanks for joining the Whitelist!
        </div>
      );
    } else if (loading) {
      return <button className={styles.button}>Loading...</button>;
    } else {
      return (
        <button onClick={addAddressToWhitelist} className={styles.button}>
          Join the Whitelist now!
        </button>
      );
    }
  } else {
    return (
      <button onClick={connectWallet} className={styles.button}>
        Please connect your wallet
      </button>
    );
  }
}
