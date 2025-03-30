// src/utils/fetchBalance.js
import { ethers } from 'ethers';

const fetchBalance = async (address, network = 'amoy') => {
  try {
    let provider;
    if (network === 'sepolia') {
      const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY;
      if (!infuraApiKey) {
        throw new Error('Infura API key not found. Please set VITE_INFURA_API_KEY in .env');
      }
      provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraApiKey}`);
    } else if (network === 'amoy') {
      provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology/');
    } else {
      throw new Error('Unsupported network');
    }

    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    return balanceInEth;
  } catch (err) {
    console.error(`Error fetching ${network} balance:`, err);
    throw new Error(`Error fetching ${network} balance`);
  }
};

export default fetchBalance;