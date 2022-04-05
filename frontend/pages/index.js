import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";
import Footer from "../components/Footer";
import ImageComponent from "../components/ImageComponent";
import Header from "../components/Header";
import ButtonComponent from "../components/ButtonComponent";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const transaction = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await transaction.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfAddressInWhitelist = async () => {
    try {
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  // const renderButton = () => {
  //   if (walletConnected) {
  //     if (joinedWhitelist) {
  //       return (
  //         <div className={styles.description}>
  //           You're in! Thanks for joining the Whitelist!
  //         </div>
  //       );
  //     } else if (loading) {
  //       return <button className={styles.button}>Loading...</button>;
  //     } else {
  //       return (
  //         <button onClick={addAddressToWhitelist} className={styles.button}>
  //           Join the Whitelist now!
  //         </button>
  //       );
  //     }
  //   } else {
  //     return (
  //       <button onClick={connectWallet} className={styles.button}>
  //         Please connect your wallet
  //       </button>
  //     );
  //   }
  // };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Header
        title="Crypto Frenchies Whitelist"
        description="Whitelist application for the Crypto Frenchies NFT collection"
      />
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Frenchies!</h1>
          <div className={styles.description}>
            An NFT Collection of pixelated Frenchies!.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted}{" "}
            {numberOfWhitelisted >= 2
              ? "people have already joined the Whitelist"
              : "person has already joined the Whitelist"}
          </div>
          <ButtonComponent
            walletConnected={walletConnected}
            joinedWhitelist={joinedWhitelist}
            addAddressToWhitelist={addAddressToWhitelist}
            connectWallet={connectWallet}
            loading={loading}
          />
        </div>
        <ImageComponent />
      </div>

      <Footer />
    </div>
  );
}
