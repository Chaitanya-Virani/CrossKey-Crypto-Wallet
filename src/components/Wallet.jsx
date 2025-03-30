import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import fetchBalance from '../utils/fetchBalance';
import PasswordManager from './PasswordManager';

function Wallet({ walletCreated, setWalletCreated }) {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [ethPrivateKey, setEthPrivateKey] = useState('');
  const [ethBalance, setEthBalance] = useState('');
  const [error, setError] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importSeedPhrase, setImportSeedPhrase] = useState('');
  const [existingWallets, setExistingWallets] = useState([]);
  const [network, setNetwork] = useState('sepolia'); // Default to 'sepolia'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track dropdown state
  const [isUnlocked, setIsUnlocked] = useState(false); // Password lock state

  // Load existing wallets only when unlocked
  useEffect(() => {
    if (isUnlocked) {
      const storedWallets = localStorage.getItem('wallets');
      if (storedWallets) {
        const wallets = JSON.parse(storedWallets);
        setExistingWallets(wallets);
      }
    }
  }, [isUnlocked]);

  // Fetch balance when address, network, or unlock state changes
  useEffect(() => {
    if (ethAddress && isUnlocked) {
      fetchWalletBalance(ethAddress, network);
    }
  }, [ethAddress, network, isUnlocked]);

  // Fetch wallet balance
  const fetchWalletBalance = async (address, selectedNetwork) => {
    try {
      const balance = await fetchBalance(address, selectedNetwork);
      setEthBalance(balance);
      setError('');
    } catch (err) {
      setEthBalance('Error fetching balance');
    }
  };

  // Shorten wallet address (6 chars at start, 5 at end)
  const shortenAddress = (address) => {
    if (!address || address.length < 11) return address; // Adjusted for 6+5
    return `${address.slice(0, 6)}......${address.slice(-5)}`;
  };

  // Load selected wallet
  const loadWallet = async (wallet) => {
    setSeedPhrase(wallet.seedPhrase);
    setEthAddress(wallet.ethAddress);
    setEthPrivateKey(wallet.ethPrivateKey);
    setWalletCreated(true);
    setShowDashboard(false);
    setError('');
    setIsDropdownOpen(false);
  };

  // Generate new wallet
  const generateWallet = async () => {
    try {
      console.log('Generating new wallet...');
      const ethWallet = ethers.Wallet.createRandom();
      const mnemonic = ethWallet.mnemonic.phrase;

      const newWallet = {
        seedPhrase: mnemonic,
        ethAddress: ethWallet.address,
        ethPrivateKey: ethWallet.privateKey,
      };

      const storedWallets = localStorage.getItem('wallets');
      const wallets = storedWallets ? JSON.parse(storedWallets) : [];
      wallets.push(newWallet);
      localStorage.setItem('wallets', JSON.stringify(wallets));

      setSeedPhrase(mnemonic);
      setEthAddress(ethWallet.address);
      setEthPrivateKey(ethWallet.privateKey);
      setExistingWallets(wallets);
      setWalletCreated(true);
      setShowDashboard(false);
      setShowImportForm(false);
      setError('');

      console.log('Wallet generated successfully');
    } catch (err) {
      console.error('Error generating wallet:', err);
      setError('Failed to generate wallet. Check console for details.');
    }
  };

  // Import wallet using seed phrase
  const importWallet = async () => {
    try {
      if (!importSeedPhrase || importSeedPhrase.split(' ').length !== 12) {
        setError('Please enter a valid 12-word seed phrase.');
        return;
      }

      const ethWallet = ethers.Wallet.fromPhrase(importSeedPhrase);
      const storedWallets = localStorage.getItem('wallets');
      const wallets = storedWallets ? JSON.parse(storedWallets) : [];
      const existingWallet = wallets.find(
        (wallet) => wallet.ethAddress === ethWallet.address
      );

      if (existingWallet) {
        setError('This wallet is already imported.');
        return;
      }

      const newWallet = {
        seedPhrase: importSeedPhrase,
        ethAddress: ethWallet.address,
        ethPrivateKey: ethWallet.privateKey,
      };

      wallets.push(newWallet);
      localStorage.setItem('wallets', JSON.stringify(wallets));

      setSeedPhrase(importSeedPhrase);
      setEthAddress(ethWallet.address);
      setEthPrivateKey(ethWallet.privateKey);
      setExistingWallets(wallets);
      setWalletCreated(true);
      setShowDashboard(false);
      setShowImportForm(false);
      setImportSeedPhrase('');
      setError('');

      console.log('Wallet imported successfully');
    } catch (err) {
      console.error('Error importing wallet:', err);
      setError('Invalid seed phrase or error importing wallet. Please try again.');
    }
  };

  // Delete a wallet
  const deleteWallet = (walletToDelete) => {
    const storedWallets = localStorage.getItem('wallets');
    const wallets = storedWallets ? JSON.parse(storedWallets) : [];
    const updatedWallets = wallets.filter(
      (wallet) => wallet.ethAddress !== walletToDelete.ethAddress
    );
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    setExistingWallets(updatedWallets);

    if (walletToDelete.ethAddress === ethAddress) {
      setSeedPhrase('');
      setEthAddress('');
      setEthPrivateKey('');
      setEthBalance('');
      setWalletCreated(false);
      setShowDashboard(true);
      setError('');
    }
    setIsDropdownOpen(false);
  };

  // Unlock handler for PasswordManager
  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  // Render PasswordManager if not unlocked
  if (!isUnlocked) {
    return <PasswordManager onUnlock={handleUnlock} />;
  }

  return (
    <div className="wallet-container">
      {showDashboard ? (
        <div className="dashboard">
          <h2>Wallet Dashboard</h2>
          <p>Select an option or manage your wallets:</p>
          <button onClick={generateWallet} className="option-button">
            Create New Wallet
          </button>
          <button
            onClick={() => {
              setShowImportForm(true);
              setShowDashboard(false);
              setError('');
            }}
            className="option-button"
          >
            Import Wallet Using Seed Phrase
          </button>
          {existingWallets.length > 0 && (
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
          )}
          {error && <p className="error">{error}</p>}
        </div>
      ) : showImportForm ? (
        <div className="import-form">
          <h2>Import Wallet</h2>
          <p>Enter your 12-word seed phrase to recover your wallet:</p>
          <textarea
            value={importSeedPhrase}
            onChange={(e) => setImportSeedPhrase(e.target.value)}
            placeholder="Enter your 12-word seed phrase (e.g., word1 word2 ... word12)"
            rows="3"
            className="seed-input"
          />
          <div className="form-buttons">
            <button onClick={importWallet} className="option-button">
              Import Wallet
            </button>
            <button
              onClick={() => {
                setShowImportForm(false);
                setShowDashboard(true);
                setImportSeedPhrase('');
                setError('');
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <div className="wallet-info">
          <h2>Wallet Details</h2>
          <div className="wallet-section">
            <h3>Seed Phrase (12 words)</h3>
            <p>{seedPhrase}</p>
          </div>
          <div className="wallet-section">
            <label htmlFor="network-select">Select Network:</label>
            <select
              id="network-select"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="network-dropdown"
            >
              <option value="sepolia">Ethereum (Sepolia Testnet)</option>
              <option value="amoy">Polygon (Amoy Testnet)</option>
            </select>
            <p>Address: {ethAddress}</p>
            <p>Private Key: {ethPrivateKey}</p>
            <p>
              Balance:{' '}
              {ethBalance
                ? `${ethBalance} ${network === 'sepolia' ? 'ETH' : 'POL'}`
                : 'Loading...'}
            </p>
          </div>
          <button
            onClick={() => {
              setWalletCreated(false);
              setShowDashboard(true);
              setError('');
            }}
            className="dashboard-button"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default Wallet;