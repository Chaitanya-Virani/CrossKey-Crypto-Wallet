import { ethers } from 'ethers';
import fetchBalance from './fetchBalance';

export const fetchWalletBalance = async (address, network, setEthBalance, setError) => {
  try {
    const balance = await fetchBalance(address, network);
    setEthBalance(balance);
    setError('');
  } catch (err) {
    setEthBalance('Error fetching balance');
  }
};

export const generateWallet = async (
  setSeedPhrase,
  setEthAddress,
  setEthPrivateKey,
  setExistingWallets,
  setWalletCreated,
  setShowDashboard,
  setShowImportForm,
  setError
) => {
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

export const importWallet = async (
  importSeedPhrase,
  setSeedPhrase,
  setEthAddress,
  setEthPrivateKey,
  setExistingWallets,
  setWalletCreated,
  setShowDashboard,
  setShowImportForm,
  setImportSeedPhrase,
  setError
) => {
  try {
    if (!importSeedPhrase || importSeedPhrase.split(' ').length !== 12) {
      setError('Please enter a valid 12-word seed phrase.');
      return;
    }

    const ethWallet = ethers.Wallet.fromPhrase(importSeedPhrase);
    const storedWallets = localStorage.getItem('wallets');
    const wallets = storedWallets ? JSON.parse(storedWallets) : [];
    const existingWallet = wallets.find((wallet) => wallet.ethAddress === ethWallet.address);

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

export const deleteWallet = (
  walletToDelete,
  setExistingWallets,
  ethAddress,
  setSeedPhrase,
  setEthAddress,
  setEthPrivateKey,
  setEthBalance,
  setWalletCreated,
  setShowDashboard,
  setError
) => {
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
};