import { useState } from 'react';

function WalletList({ existingWallets, loadWallet, deleteWallet }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const shortenAddress = (address) => {
    if (!address || address.length < 11) return address;
    return `${address.slice(0, 6)}......${address.slice(-5)}`;
  };

  return (
     <div className="wallet-list">
      <h3>Existing Wallets</h3>
      <div className="custom-dropdown">
        <button
          className="dropdown-toggle"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Select a Wallet {isDropdownOpen ? '▲' : '▼'}
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            {existingWallets.map((wallet, index) => (
              <div key={index} className="dropdown-item">
                <button
                  onClick={() => loadWallet(wallet)}
                  className="wallet-option"
                >
                  {shortenAddress(wallet.ethAddress)}
                </button>
                <button
                  onClick={() => deleteWallet(wallet)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletList;
