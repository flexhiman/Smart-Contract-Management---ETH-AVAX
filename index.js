import { useState, useEffect } from "react";
import { ethers } from "ethers";
import SharedOfficeBookingSystemAbi from "../artifacts/contracts/SharedOfficeBookingSystem.sol/SharedOfficeBookingSystem.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [OfficeBookingSystem, setOfficeBookingSystem] = useState(undefined);
  const [officeAvailability, setOfficeAvailability] = useState({});
  const [message, setMessage] = useState("");
  const [officeName, setOfficeName] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [bookingDuration, setBookingDuration] = useState(1); // Default booking duration
  const [ownerEarnings, setOwnerEarnings] = useState(0);

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Update with your contract address
  const OfficeBookingSystemABI = SharedOfficeBookingSystemAbi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(undefined);
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getOfficeBookingSystemContract();
    } catch (error) {
      setMessage("Error connecting account: " + (error.message || error));
    }
  };

  const getOfficeBookingSystemContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const OfficeBookingSystemContract = new ethers.Contract(contractAddress, OfficeBookingSystemABI, signer);
    setOfficeBookingSystem(OfficeBookingSystemContract);
  };

  const addOffice = async () => {
    setMessage("");
    if (OfficeBookingSystem) {
      try {
        let tx = await OfficeBookingSystem.addOffice(officeName, ethers.utils.parseEther("10")); // Default price per hour, change if needed
        await tx.wait();
        setMessage("Office added successfully!");
      } catch (error) {
        setMessage("Error adding office: " + (error.message || error));
      }
    }
  };

  const bookOffice = async () => {
    setMessage("");
    if (OfficeBookingSystem) {
      try {
        const officeDetails = await OfficeBookingSystem.checkOfficeAvailability(officeId);
        const pricePerHour = officeDetails[2]; // Extract pricePerHour from response
        let totalCost = pricePerHour.mul(bookingDuration); // Calculate total cost based on duration
        let tx = await OfficeBookingSystem.bookOffice(officeId, bookingDuration, { value: totalCost });
        await tx.wait();
        checkOfficeAvailability(officeId);
        setMessage("Office booked successfully!");

        // Refresh earnings after booking
        await getOwnerEarnings();
      } catch (error) {
        setMessage("Unable to book office: " + (error.message || error));
      }
    }
  };

  const returnOffice = async () => {
    setMessage("");
    if (OfficeBookingSystem) {
      try {
        let tx = await OfficeBookingSystem.returnOffice(officeId);
        await tx.wait();
        checkOfficeAvailability(officeId);
        setMessage("Office returned successfully!");

        // Refresh earnings after returning
        await getOwnerEarnings();
      } catch (error) {
        setMessage("Unable to return office: " + (error.message || error));
      }
    }
  };

  const withdrawEarnings = async () => {
    setMessage("");
    if (OfficeBookingSystem) {
      try {
        let tx = await OfficeBookingSystem.withdrawEarnings();
        await tx.wait();
        setMessage("Earnings withdrawn successfully!");
      } catch (error) {
        setMessage("Unable to withdraw earnings: " + (error.message || error));
      }
    }
  };

  const checkOfficeAvailability = async (officeId) => {
    try {
      if (OfficeBookingSystem) {
        const [officeName, isBooked, pricePerHour, owner] = await OfficeBookingSystem.checkOfficeAvailability(officeId);
        setOfficeAvailability((prev) => ({ ...prev, [officeId]: { officeName, isBooked, pricePerHour, owner } }));
      }
    } catch (error) {
      setMessage("Error fetching office availability: " + (error.message || error));
    }
  };

  const getOwnerEarnings = async () => {
    try {
      if (OfficeBookingSystem) {
        const earnings = await OfficeBookingSystem.earnings(account);
        setOwnerEarnings(ethers.utils.formatEther(earnings));
      }
    } catch (error) {
      setMessage("Error fetching earnings: " + (error.message || error));
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this office booking system.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect MetaMask Wallet</button>;
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Rent office  for 10 [ETH/hrs] </p>
        <div className="office-actions">
          <input
            type="text"
            placeholder="Office Name"
            value={officeName}
            onChange={(e) => setOfficeName(e.target.value)}
          />
          <button onClick={addOffice}>Add Office</button>

          <input
            type="text"
            placeholder="Office ID"
            value={officeId}
            onChange={(e) => setOfficeId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Booking Duration (hours)"
            value={bookingDuration}
            onChange={(e) => setBookingDuration(e.target.value)}
          />
          <button onClick={bookOffice}>Book Office</button>
          <button onClick={returnOffice}>Return Office</button>

          <div className="office-info">
            {Object.keys(officeAvailability).map((officeId) => (
              <div key={officeId}>
                <p>Office ID: {officeId}</p>
                <p>Office Name: {officeAvailability[officeId].officeName}</p>
                <p>Price Per Hour: {ethers.utils.formatEther(officeAvailability[officeId].pricePerHour)} ETH</p>
                <p>Status: {officeAvailability[officeId].isBooked ? "Booked" : "Available"}</p>
                <p>Owner: {officeAvailability[officeId].owner}</p>
                <button onClick={() => checkOfficeAvailability(officeId)}>Check Office Availability</button>
              </div>
            ))}
          </div>

          <p>Your Earnings: {ownerEarnings} ETH</p>
          <button onClick={withdrawEarnings}>Withdraw Earnings</button>
        </div>
        {message && <p><strong>{message}</strong></p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
    if (account) {
      getOwnerEarnings();
    }
  }, [account]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to Shared Office Booking System</h1>
      </header>
      {initUser()}
      <style jsx>{`
         .container {
          text-align: center;
          background-color: white;
          color: white;
          font-family: "Times New Roman", serif;
          border: 10px solid black;
          border-radius: 20px;
          background-image: url("https://i.pinimg.com/originals/d0/08/f5/d008f53d0f2227feb7bdade0aa1d054e.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          height: 850px;
          width: 1500px;
          
          font-weight: 1000;
          padding: 20px;
        }

        header {
          padding: 10px;
        }

        h1 {
          font-family: "Arial", serif;
          font-size: 60px;
          margin-bottom: 20px;
        }

        .task-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        button {
          background-color: #4caf50;
          color: black;
          border: none;
          padding: 15px 25px;
          font-size: 22px;
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        button:hover {
          background-color: #388e3c;
        }
      `}</style>
    </main>
  );
}
