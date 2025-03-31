import { ethers } from 'ethers';
import fetchBalance from './fetchBalance';

// Infura Sepolia URL using environment variable
const INFURA_SEPOLIA_URL = `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`;
// Public Amoy RPC URL
const AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology';

export const fetchWalletBalance = async (address, network, setEthBalance, setError) => {
  try {
    console.log('Fetching balance for:', address, 'on network:', network);
    const balance = await fetchBalance(address, network);
    console.log('Balance fetched:', balance);
    setEthBalance(balance);
    setError('');
  } catch (err) {
    console.error('Error fetching balance:', err);
    setEthBalance('Error');
    setError('Failed to fetch balance: ' + err.message);
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
    setError('Failed to generate wallet: ' + err.message);
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
    console.log('Importing wallet with seed phrase:', importSeedPhrase);

    // Normalize the seed phrase: trim and replace multiple spaces with a single space
    const normalizedSeedPhrase = importSeedPhrase.trim().replace(/\s+/g, ' ');
    console.log('Normalized seed phrase:', normalizedSeedPhrase);

    // Check if the seed phrase is empty or not 12 words
    if (!normalizedSeedPhrase) {
      setError('Seed phrase cannot be empty.');
      return;
    }

    const words = normalizedSeedPhrase.split(' ');
    if (words.length !== 12) {
      setError(`Seed phrase must be exactly 12 words. You entered ${words.length} words.`);
      return;
    }

    // Create wallet from seed phrase
    const ethWallet = ethers.Wallet.fromPhrase(normalizedSeedPhrase);
    console.log('Imported wallet address:', ethWallet.address);

    const storedWallets = localStorage.getItem('wallets');
    const wallets = storedWallets ? JSON.parse(storedWallets) : [];
    const existingWallet = wallets.find(
      (wallet) => wallet.ethAddress.toLowerCase() === ethWallet.address.toLowerCase()
    );

    if (existingWallet) {
      setError('This wallet is already imported.');
      return;
    }

    const newWallet = {
      seedPhrase: normalizedSeedPhrase,
      ethAddress: ethWallet.address,
      ethPrivateKey: ethWallet.privateKey,
    };

    wallets.push(newWallet);
    localStorage.setItem('wallets', JSON.stringify(wallets));

    setSeedPhrase(normalizedSeedPhrase);
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
    if (err.message.includes('invalid mnemonic')) {
      setError('Invalid seed phrase. Please ensure all words are correct and part of the BIP-39 wordlist.');
    } else {
      setError('Error importing wallet: ' + err.message);
    }
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

export const transferBalance = async (
  ethPrivateKey,
  recipientAddress,
  transferAmount,
  network,
  ethAddress,
  setTransactionHash,
  setError,
  updateBalance,
  setRecipientAddress,
  setTransferAmount,
  setTransferSuccess
) => {
  try {
    console.log('Starting transfer to:', recipientAddress, 'amount:', transferAmount);
    if (!ethers.isAddress(recipientAddress)) {
      setError('Invalid recipient address.');
      setRecipientAddress('');
      setTransferAmount('');
      updateBalance();
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive amount.');
      setRecipientAddress('');
      setTransferAmount('');
      updateBalance();
      return;
    }

    let provider;
    if (network === 'sepolia') {
      provider = new ethers.JsonRpcProvider(INFURA_SEPOLIA_URL);
      console.log('Using Sepolia provider:', INFURA_SEPOLIA_URL);
    } else if (network === 'amoy') {
      provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
      console.log('Using Amoy provider:', AMOY_RPC_URL);
    } else {
      setError('Unsupported network.');
      setRecipientAddress('');
      setTransferAmount('');
      updateBalance();
      return;
    }

    const wallet = new ethers.Wallet(ethPrivateKey, provider);
    const amountInWei = ethers.parseEther(transferAmount.toString());
    console.log('Amount in Wei:', amountInWei.toString(), 'Type:', typeof amountInWei);

    const balance = await provider.getBalance(ethAddress);
    console.log('Balance:', balance.toString(), 'Type:', typeof balance);

    if (balance < amountInWei) {
      setError('Insufficient balance for transfer.');
      setRecipientAddress('');
      setTransferAmount('');
      updateBalance();
      return;
    }

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const gasLimit = BigInt(21000);
    console.log('Gas Price:', gasPrice.toString(), 'Type:', typeof gasPrice);
    console.log('Gas Limit:', gasLimit.toString(), 'Type:', typeof gasLimit);

    const gasCost = gasPrice * gasLimit;
    console.log('Gas Cost:', gasCost.toString(), 'Type:', typeof gasCost);

    const totalCost = amountInWei + gasCost;
    console.log('Total Cost:', totalCost.toString(), 'Type:', typeof totalCost);

    if (balance < totalCost) {
      setError('Insufficient balance to cover gas fees.');
      setRecipientAddress('');
      setTransferAmount('');
      updateBalance();
      return;
    }

    const tx = {
      to: recipientAddress,
      value: amountInWei,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };

    const transaction = await wallet.sendTransaction(tx);
    console.log('Transaction sent:', transaction.hash);
    setTransactionHash(transaction.hash);

    await transaction.wait();
    console.log('Transaction confirmed, updating balance...');
    updateBalance();
    setRecipientAddress('');
    setTransferAmount('');
    setError('');
    setTransferSuccess(true);
    console.log('Transfer successful');
  } catch (err) {
    console.error('Transfer error:', err);
    setError(`Failed to transfer: ${err.message}`);
    setTransferSuccess(false);
    setRecipientAddress('');
    setTransferAmount('');
    updateBalance();
  }
};