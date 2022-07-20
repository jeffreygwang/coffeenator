import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Header from "./header"
import variables from "./variables.js"
import styles from '../styles/Home.module.css'
import MemoMsg from "./memoMsg"

export default function Home() {
  // Contract Address & ABI
  const contractAddress = variables.contractAddress;
  const contractABI = abi.abi;

  // Hooks defining application state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [amt, setAmt] = useState(""); // string
  const [memos, setMemos] = useState([]); 
  const [retMsg, setRetMsg] = useState("");

  const onAmtChange = (event) => {
    setAmt(event.target.value)
  }

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("Wallet Connected: " + account);
      } else {
        console.log("Make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("Please install MetaMask.");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        provider.getCode(contractAddress)
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("Buying coffee..");
        setRetMsg("Buying coffee...");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "Anon",
          message ? message : "Enjoy your coffee!",
          {value: ethers.utils.parseEther(amt)}
        );

        await coffeeTxn.wait();
        
        let retmsg = "Mined this block: " + coffeeTxn.hash;
        console.log(retmsg)
        setRetMsg(retmsg);

        console.log("Coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        // const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("Fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log(memos);
        console.log("Fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
  // Running functions
  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;

    // Listen for new memos.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Header name="Jeffrey"></Header>

      <main className={styles.main}>
        <h1>Buy Jeffrey A Coffee!</h1>

        <p className={styles.warning}> This is currently deployed on the Goerli TestNet.</p>

        {currentAccount ? (
          <div>
            <form>
              <div className="formgroup">
                <label>
                  Name
                </label>
                <br/>
                
                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                  />
              </div>
              <br/>
              <div className="formgroup">
                <label>
                  Send Jeffrey a message
                </label>
                <br/>

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>

              <div className="formgroup">
                <label>
                  Enter ETH (0.001 ~ $3)
                </label>
                <br/>

                <textarea
                  rows={3}
                  placeholder="0.001"
                  id="message"
                  onChange={onAmtChange}
                  required
                >
                </textarea>
              </div>

              <div>
                <button type="button" onClick={buyCoffee}>
                  Send Coffee
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect your wallet </button>
        )}

        {currentAccount && (retMsg ? (<p>Coffee Sent! {retMsg}</p>) : <p></p>)}

        {currentAccount && (memos ? (<h1>Memos Received</h1>) : <h3>No Messages Yet.</h3> )}
      
        {currentAccount && (memos.map((memo, idx) => {
            return <MemoMsg memo={memo} idx={idx} key={idx}></MemoMsg>
        }))}
      </main>
    </div>
  )
}
