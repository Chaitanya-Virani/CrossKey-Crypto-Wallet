import { useState } from "react";
import { Tooltip } from "antd";
import { CopyOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";

function WalletDetails({
  seedPhrase,
  ethAddress,
  ethPrivateKey,
  ethBalance,
  network,
  setNetwork,
  setWalletCreated,
  setShowDashboard,
  setError,
  recipientAddress,
  setRecipientAddress,
  transferAmount,
  setTransferAmount,
  transactionHash,
  setTransactionHash,
  transferSuccess,
  setTransferSuccess,
  transferBalance,
}) {
  const [isSeedPhraseVisible, setIsSeedPhraseVisible] = useState(false);
  const [isTransferVisible, setIsTransferVisible] = useState(false); // New state for Transfer Balance dropdown

  const shortenAddress = (address) => {
    if (!address || address.length < 11) return address;
    return `${address.slice(0, 6)}......${address.slice(-5)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied successfully!");
    }).catch((err) => {
      alert("Failed to copy!");
      console.error("Clipboard copy failed:", err);
    });
  };

  return (
    <div className="wallet-detail">
      <div className="network-section">
        <select
          id="network-select"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="network-dropdown"
        >
          <option value="sepolia">Ethereum (Sepolia Testnet)</option>
          <option value="amoy">Polygon (Amoy Testnet)</option>
        </select>
      </div>

      <div className="balance-section">
        <h2>
          Balance:{" "}
          {ethBalance
            ? `${ethBalance} ${network === "sepolia" ? "ETH" : "POL"}`
            : "Loading..."}
        </h2>
      </div>

      <div className="wallet-address-section">
        <div className="wallet-address-container">
          <p className="wallet-address">{shortenAddress(ethAddress)}</p>
          <Tooltip title="Copy address">
            <CopyOutlined
              className="copyButton"
              onClick={() => copyToClipboard(ethAddress)}
            />
          </Tooltip>
        </div>
      </div>

      <div className="wallet-info">
        <h2>Wallet Details</h2>
        <div className="wallet-section">
          <div
            className="collapsible-header"
            onClick={() => setIsSeedPhraseVisible(!isSeedPhraseVisible)}
          >
            <h3>Seed Phrase (12 words)</h3>
            {isSeedPhraseVisible ? <UpOutlined /> : <DownOutlined />}
          </div>
          {isSeedPhraseVisible && (
            <div className="collapsible-content">
              <p>{seedPhrase}</p>
            </div>
          )}
        </div>

        {/* Modified Transfer Balance Section with Dropdown */}
        <div className="transfer-section">
          <div
            className="collapsible-header"
            onClick={() => setIsTransferVisible(!isTransferVisible)}
          >
            <h3>Transfer Balance</h3>
            {isTransferVisible ? <UpOutlined /> : <DownOutlined />}
          </div>
          {isTransferVisible && (
            <div className="collapsible-content">
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter Recipient Address (e.g., 0x123…)"
                className="transfer-input"
              />
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder={`Enter Amount (e.g., 0.01 ${
                  network === "sepolia" ? "ETH" : "POL"
                })`}
                className="transfer-input"
                step="0.0001"
                min="0"
              />
              <button onClick={transferBalance} className="transfer-button">
                Transfer
              </button>
              {transferSuccess && (
                <p className="success-message">Transfer successful!</p>
              )}
              {transactionHash && (
                <p className="transaction-info">
                  <a
                    href={
                      network === "sepolia"
                        ? `https://sepolia.etherscan.io/tx/${transactionHash}`
                        : `https://amoy.polygonscan.com/tx/${transactionHash}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Transaction
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setWalletCreated(false);
            setShowDashboard(true);
            setError("");
          }}
          className="dashboard-button"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default WalletDetails;