import { ethers } from 'ethers';

// Infura Sepolia URL using environment variable
const INFURA_SEPOLIA_URL = `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`;
// Public Amoy RPC URL
const AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology';

const fetchBalance = async (address, network) => {
  try {
    let provider;
    if (network === 'sepolia') {
      provider = new ethers.JsonRpcProvider(INFURA_SEPOLIA_URL);
      console.log('Fetching balance using Sepolia provider:', INFURA_SEPOLIA_URL);
    } else if (network === 'amoy') {
      provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
      console.log('Fetching balance using Amoy provider:', AMOY_RPC_URL);
    } else {
      throw new Error('Unsupported network');
    }

    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.formatEther(balance);
    console.log(`Raw balance for ${address} on ${network}: ${balance.toString()} wei, formatted: ${formattedBalance}`);
    return formattedBalance;
  } catch (err) {
    console.error('Error in fetchBalance:', err);
    throw err;
  }
};

export default fetchBalance;