import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionCount, setTransactionCount] = useState(undefined);
  const [loading, setLoading] = useState(false); 
  const [amount, setAmount] = useState(1); 
  const [transactions, setTransactions] = useState([]); 
  const [darkMode, setDarkMode] = useState(false); 

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const getTransactionCount = async () => {
    if (atm) {
      setTransactionCount((await atm.numberOfTransactions()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        setLoading(true); 
        let tx = await atm.deposit(amount); 
        await tx.wait();
        setTransactions([...transactions, { type: "Deposit", amount, timestamp: new Date().toLocaleString() }]); // Update transaction history
        getBalance();
        getTransactionCount();
        alert("Deposit successful!");
      } catch (error) {
        alert("Transaction failed.");
      } finally {
        setLoading(false); 
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        setLoading(true); 
        let tx = await atm.withdraw(amount); 
        await tx.wait();
        setTransactions([...transactions, { type: "Withdraw", amount, timestamp: new Date().toLocaleString() }]); 
        getBalance();
        getTransactionCount();
        alert("Withdrawal successful!");
      } catch (error) {
        alert("Transaction failed.");
      } finally {
        setLoading(false); /
      }
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your MetaMask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    if (transactionCount === undefined) {
      getTransactionCount();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <p>Number of Transactions: {transactionCount}</p>
        
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Enter amount" 
          min="1"
        />
        
        {loading ? <p>Transaction in progress...</p> : null}

        <button onClick={deposit} disabled={loading}>Deposit {amount} ETH</button>
        <button onClick={withdraw} disabled={loading}>Withdraw {amount} ETH</button>

        <h3>Transaction History</h3>
        <ul>
          {transactions.map((tx, index) => (
            <li key={index}>
              {tx.type} of {tx.amount} ETH on {tx.timestamp}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className={darkMode ? "dark" : "light"}>
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
        <button onClick={toggleDarkMode}>
          Toggle {darkMode ? "Light" : "Dark"} Mode
        </button>
      </header>

      {initUser()}

      <style jsx>{`
        main {
          text-align: center;
          background-image: url('https://www.imageshine.in/uploads/gallery/Free-vector-watercolor-background-Wallpaper.jpg');
          background-size: cover;
          background-position: center;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: ${darkMode ? 'white' : 'black'};
        }

        .dark {
          background-color: #333;
          color: white;
        }

        .light {
          background-color: white;
          color: black;
        }

        input {
          margin-bottom: 10px;
          padding: 5px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        button {
          margin: 10px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          border: none;
          border-radius: 5px;
        }

        button:disabled {
          background-color: #ccc;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          background: ${darkMode ? '#444' : '#f9f9f9'};
          margin: 5px 0;
          padding: 10px;
          border-radius: 5px;
          width: 100%;
          max-width: 300px;
        }
      `}
      </style>
    </main>
  );
}
