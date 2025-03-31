import { useState, useEffect } from 'react';
import WalletDashboard from './WalletDashboard';
import WalletImportForm from './WalletImportForm';
import WalletDetails from './WalletDetails';
import PasswordManager from './PasswordManager';
import { generateWallet, importWallet, fetchWalletBalance, deleteWallet } from '../utils/walletUtils';

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
  const [network, setNetwork] = useState('sepolia');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (isUnlocked) {
      const storedWallets = localStorage.getItem('wallets');
      if (storedWallets) setExistingWallets(JSON.parse(storedWallets));
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (ethAddress && isUnlocked) {
      fetchWalletBalance(ethAddress, network, setEthBalance, setError);
    }
  }, [ethAddress, network, isUnlocked]);

  const handleUnlock = () => setIsUnlocked(true);

  if (!isUnlocked) {
    return <PasswordManager onUnlock={handleUnlock} />;
  }

  return (
    <div className="wallet-container">
      {showDashboard ? (
        <WalletDashboard
          generateWallet={() => generateWallet(setSeedPhrase, setEthAddress, setEthPrivateKey, setExistingWallets, setWalletCreated, setShowDashboard, setShowImportForm, setError)}
          setShowImportForm={setShowImportForm}
          setShowDashboard={setShowDashboard}
          existingWallets={existingWallets}
          setEthAddress={setEthAddress}
          setSeedPhrase={setSeedPhrase}
          setEthPrivateKey={setEthPrivateKey}
          setWalletCreated={setWalletCreated}
          setError={setError}
          deleteWallet={(wallet) => deleteWallet(wallet, setExistingWallets, ethAddress, setSeedPhrase, setEthAddress, setEthPrivateKey, setEthBalance, setWalletCreated, setShowDashboard, setError)}
          error={error}
        />
      ) : showImportForm ? (
        <WalletImportForm
          importSeedPhrase={importSeedPhrase}
          setImportSeedPhrase={setImportSeedPhrase}
          importWallet={() => importWallet(importSeedPhrase, setSeedPhrase, setEthAddress, setEthPrivateKey, setExistingWallets, setWalletCreated, setShowDashboard, setShowImportForm, setImportSeedPhrase, setError)}
          setShowImportForm={setShowImportForm}
          setShowDashboard={setShowDashboard}
          error={error}
        />
      ) : (
        <WalletDetails
          seedPhrase={seedPhrase}
          ethAddress={ethAddress}
          ethPrivateKey={ethPrivateKey}
          ethBalance={ethBalance}
          network={network}
          setNetwork={setNetwork}
          setWalletCreated={setWalletCreated}
          setShowDashboard={setShowDashboard}
          setError={setError}
        />
      )}
    </div>
  );
}

export default Wallet;