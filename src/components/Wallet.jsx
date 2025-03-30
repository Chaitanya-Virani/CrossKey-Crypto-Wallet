import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

function Wallet({ walletCreated, setWalletCreated }) {
  const [seedPhrase, setSeedPhrase] = useState('')
  const [ethAddress, setEthAddress] = useState('')
  const [ethPrivateKey, setEthPrivateKey] = useState('')
  const [ethBalance, setEthBalance] = useState('')
  const [error, setError] = useState('')
  const [showOptions, setShowOptions] = useState(true)
  const [showImportForm, setShowImportForm] = useState(false)
  const [importSeedPhrase, setImportSeedPhrase] = useState('')
  const [existingWallets, setExistingWallets] = useState([]) // List of existing wallets

  // Check for existing wallets on mount
  useEffect(() => {
    const storedWallets = localStorage.getItem('wallets')
    if (storedWallets) {
      const wallets = JSON.parse(storedWallets)
      setExistingWallets(wallets)
    }
  }, [])

  // Function to fetch ETH balance using Infura (Sepolia Testnet)
  const fetchEthBalance = async (address) => {
    try {
      const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY
      if (!infuraApiKey) {
        throw new Error('Infura API key not found. Please set VITE_INFURA_API_KEY in .env')
      }

      const provider = new ethers.JsonRpcProvider(
        `https://sepolia.infura.io/v3/${infuraApiKey}`
      )
      const balance = await provider.getBalance(address)
      const balanceInEth = ethers.formatEther(balance)
      setEthBalance(balanceInEth)
    } catch (err) {
      console.error('Error fetching ETH balance:', err)
      setEthBalance('Error fetching balance')
    }
  }

  // Load selected wallet
  const loadWallet = (wallet) => {
    try {
      setSeedPhrase(wallet.seedPhrase)
      setEthAddress(wallet.ethAddress)
      setEthPrivateKey(wallet.ethPrivateKey)
      setWalletCreated(true)
      setShowOptions(false)
      setShowImportForm(false)
      setError('')
      fetchEthBalance(wallet.ethAddress)
    } catch (err) {
      console.error('Error loading wallet:', err)
      setError('Failed to load wallet.')
    }
  }

  // Generate new wallet
  const generateWallet = () => {
    try {
      console.log('Generating new wallet...')

      const ethWallet = ethers.Wallet.createRandom()
      const mnemonic = ethWallet.mnemonic.phrase

      // Create wallet object
      const newWallet = {
        seedPhrase: mnemonic,
        ethAddress: ethWallet.address,
        ethPrivateKey: ethWallet.privateKey,
      }

      // Add to existing wallets in localStorage
      const storedWallets = localStorage.getItem('wallets')
      const wallets = storedWallets ? JSON.parse(storedWallets) : []
      wallets.push(newWallet)
      localStorage.setItem('wallets', JSON.stringify(wallets))

      // Update state
      setSeedPhrase(mnemonic)
      setEthAddress(ethWallet.address)
      setEthPrivateKey(ethWallet.privateKey)
      setExistingWallets(wallets)
      setWalletCreated(true)
      setShowOptions(false)
      setShowImportForm(false)
      setError('')

      fetchEthBalance(ethWallet.address)

      console.log('Wallet generated successfully')
    } catch (err) {
      console.error('Error generating wallet:', err)
      setError('Failed to generate wallet. Check console for details.')
    }
  }

  // Import wallet using seed phrase
  const importWallet = () => {
    try {
      // Validate seed phrase
      if (!importSeedPhrase || importSeedPhrase.split(' ').length !== 12) {
        setError('Please enter a valid 12-word seed phrase.')
        return
      }

      // Recover Ethereum wallet from seed phrase
      const ethWallet = ethers.Wallet.fromPhrase(importSeedPhrase)

      // Create wallet object
      const newWallet = {
        seedPhrase: importSeedPhrase,
        ethAddress: ethWallet.address,
        ethPrivateKey: ethWallet.privateKey,
      }

      // Add to existing wallets in localStorage
      const storedWallets = localStorage.getItem('wallets')
      const wallets = storedWallets ? JSON.parse(storedWallets) : []
      // Avoid duplicates by checking if the address already exists
      if (wallets.some((wallet) => wallet.ethAddress === ethWallet.address)) {
        setError('This wallet is already imported.')
        return
      }
      wallets.push(newWallet)
      localStorage.setItem('wallets', JSON.stringify(wallets))

      // Update state
      setSeedPhrase(importSeedPhrase)
      setEthAddress(ethWallet.address)
      setEthPrivateKey(ethWallet.privateKey)
      setExistingWallets(wallets)
      setWalletCreated(true)
      setShowOptions(false)
      setShowImportForm(false)
      setError('')

      fetchEthBalance(ethWallet.address)

      console.log('Wallet imported successfully')
    } catch (err) {
      console.error('Error importing wallet:', err)
      setError('Invalid seed phrase or error importing wallet. Please try again.')
    }
  }

  return (
    <div className="wallet-container">
      {showOptions ? (
        <div className="wallet-options">
          <h2>Welcome to Your Wallet</h2>
          <p>Please choose an option:</p>
          <button onClick={generateWallet} className="option-button">
            Create New Wallet
          </button>
          <button
            onClick={() => {
              setShowImportForm(true)
              setShowOptions(false)
              setError('')
            }}
            className="option-button"
          >
            Import Wallet Using Seed Phrase
          </button>
          {existingWallets.length > 0 && (
            <div className="wallet-list">
              <h3>Existing Wallets</h3>
              <ul>
                {existingWallets.map((wallet, index) => (
                  <li key={index}>
                    <button
                      onClick={() => loadWallet(wallet)}
                      className="wallet-select-button"
                    >
                      {wallet.ethAddress}
                    </button>
                  </li>
                ))}
              </ul>
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
            onChange={(e) => setImportSeedPhrase(e.target.value.trim())}
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
                setShowImportForm(false)
                setShowOptions(true)
                setImportSeedPhrase('')
                setError('')
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
            <h3>Ethereum (Sepolia Testnet)</h3>
            <p>Address: {ethAddress}</p>
            <p>Private Key: {ethPrivateKey}</p>
            <p>Balance: {ethBalance ? `${ethBalance} ETH` : 'Loading...'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wallet