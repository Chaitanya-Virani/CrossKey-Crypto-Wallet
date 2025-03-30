import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import bcrypt from 'bcryptjs'

function Wallet({ walletCreated, setWalletCreated }) {
  const [seedPhrase, setSeedPhrase] = useState('')
  const [ethAddress, setEthAddress] = useState('')
  const [ethPrivateKey, setEthPrivateKey] = useState('')
  const [ethBalance, setEthBalance] = useState('')
  const [error, setError] = useState('')
  const [showOptions, setShowOptions] = useState(true)
  const [showImportForm, setShowImportForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showViewPasswordForm, setShowViewPasswordForm] = useState(false)
  const [importSeedPhrase, setImportSeedPhrase] = useState('')
  const [password, setPassword] = useState('')
  const [viewPassword, setViewPassword] = useState('')
  const [existingWallets, setExistingWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState(null)

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

  // Load selected wallet (prompt for password if it exists)
  const loadWallet = (wallet) => {
    setSelectedWallet(wallet)
    if (wallet.passwordHash) {
      setShowViewPasswordForm(true)
      setShowOptions(false)
      setShowImportForm(false)
      setError('')
    } else {
      // Handle wallets created before password feature (no password required)
      setSeedPhrase(wallet.seedPhrase)
      setEthAddress(wallet.ethAddress)
      setEthPrivateKey(wallet.ethPrivateKey)
      setWalletCreated(true)
      setShowOptions(false)
      setShowImportForm(false)
      setError('')
      fetchEthBalance(wallet.ethAddress)
    }
  }

  // Verify password and view wallet details
  const verifyPasswordAndView = () => {
    if (!selectedWallet) {
      setError('No wallet selected.')
      return
    }

    if (!selectedWallet.passwordHash) {
      // Shouldn’t reach here, but just in case
      setSeedPhrase(selectedWallet.seedPhrase)
      setEthAddress(selectedWallet.ethAddress)
      setEthPrivateKey(selectedWallet.ethPrivateKey)
      setWalletCreated(true)
      setShowViewPasswordForm(false)
      setShowOptions(false)
      setError('')
      fetchEthBalance(selectedWallet.ethAddress)
      return
    }

    bcrypt.compare(viewPassword, selectedWallet.passwordHash, (err, isMatch) => {
      if (err) {
        console.error('Error verifying password:', err)
        setError('Error verifying password.')
        return
      }

      if (isMatch) {
        setSeedPhrase(selectedWallet.seedPhrase)
        setEthAddress(selectedWallet.ethAddress)
        setEthPrivateKey(selectedWallet.ethPrivateKey)
        setWalletCreated(true)
        setShowViewPasswordForm(false)
        setShowOptions(false)
        setShowImportForm(false)
        setError('')
        setViewPassword('')
        fetchEthBalance(selectedWallet.ethAddress)
      } else {
        setError('Incorrect password.')
      }
    })
  }

  // Generate new wallet
  const generateWallet = () => {
    if (!password) {
      setError('Please set a password.')
      return
    }

    try {
      console.log('Generating new wallet...')

      const ethWallet = ethers.Wallet.createRandom()
      const mnemonic = ethWallet.mnemonic.phrase

      // Hash the password
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err)
          setError('Error creating wallet.')
          return
        }

        const newWallet = {
          seedPhrase: mnemonic,
          ethAddress: ethWallet.address,
          ethPrivateKey: ethWallet.privateKey,
          passwordHash: hash,
        }

        const storedWallets = localStorage.getItem('wallets')
        const wallets = storedWallets ? JSON.parse(storedWallets) : []
        wallets.push(newWallet)
        localStorage.setItem('wallets', JSON.stringify(wallets))

        setSeedPhrase(mnemonic)
        setEthAddress(ethWallet.address)
        setEthPrivateKey(ethWallet.privateKey)
        setExistingWallets(wallets)
        setWalletCreated(true)
        setShowOptions(false)
        setShowImportForm(false)
        setShowPasswordForm(false)
        setPassword('')
        setError('')

        fetchEthBalance(ethWallet.address)

        console.log('Wallet generated successfully')
      })
    } catch (err) {
      console.error('Error generating wallet:', err)
      setError('Failed to generate wallet. Check console for details.')
    }
  }

  // Import wallet using seed phrase
  const importWallet = () => {
    try {
      if (!importSeedPhrase || importSeedPhrase.split(' ').length !== 12) {
        setError('Please enter a valid 12-word seed phrase.')
        return
      }

      const ethWallet = ethers.Wallet.fromPhrase(importSeedPhrase)

      const storedWallets = localStorage.getItem('wallets')
      const wallets = storedWallets ? JSON.parse(storedWallets) : []
      const existingWallet = wallets.find(
        (wallet) => wallet.ethAddress === ethWallet.address
      )

      if (existingWallet) {
        setSelectedWallet(existingWallet)
        if (existingWallet.passwordHash) {
          setShowViewPasswordForm(true)
          setShowImportForm(false)
          setError('')
        } else {
          // No password set previously, load directly
          setSeedPhrase(existingWallet.seedPhrase)
          setEthAddress(existingWallet.ethAddress)
          setEthPrivateKey(existingWallet.ethPrivateKey)
          setWalletCreated(true)
          setShowOptions(false)
          setShowImportForm(false)
          setShowPasswordForm(false)
          setError('')
          fetchEthBalance(existingWallet.ethAddress)
        }
        return
      }

      if (!password) {
        setError('Please set a password.')
        return
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err)
          setError('Error importing wallet.')
          return
        }

        const newWallet = {
          seedPhrase: importSeedPhrase,
          ethAddress: ethWallet.address,
          ethPrivateKey: ethWallet.privateKey,
          passwordHash: hash,
        }

        wallets.push(newWallet)
        localStorage.setItem('wallets', JSON.stringify(wallets))

        setSeedPhrase(importSeedPhrase)
        setEthAddress(ethWallet.address)
        setEthPrivateKey(ethWallet.privateKey)
        setExistingWallets(wallets)
        setWalletCreated(true)
        setShowOptions(false)
        setShowImportForm(false)
        setShowPasswordForm(false)
        setPassword('')
        setImportSeedPhrase('')
        setError('')

        fetchEthBalance(ethWallet.address)

        console.log('Wallet imported successfully')
      })
    } catch (err) {
      console.error('Error importing wallet:', err)
      setError('Invalid seed phrase or error importing wallet. Please try again.')
    }
  }

  // Delete a wallet
  const deleteWallet = (walletToDelete) => {
    const storedWallets = localStorage.getItem('wallets')
    const wallets = storedWallets ? JSON.parse(storedWallets) : []
    const updatedWallets = wallets.filter(
      (wallet) => wallet.ethAddress !== walletToDelete.ethAddress
    )
    localStorage.setItem('wallets', JSON.stringify(updatedWallets))
    setExistingWallets(updatedWallets)

    if (walletToDelete.ethAddress === ethAddress) {
      setSeedPhrase('')
      setEthAddress('')
      setEthPrivateKey('')
      setEthBalance('')
      setWalletCreated(false)
      setShowOptions(true)
      setShowImportForm(false)
      setShowPasswordForm(false)
      setShowViewPasswordForm(false)
      setError('')
    }
  }

  return (
    <div className="wallet-container">
      {showOptions ? (
        <div className="wallet-options">
          <h2>Welcome to Your Wallet</h2>
          <p>Please choose an option:</p>
          <button
            onClick={() => {
              setShowPasswordForm(true)
              setShowOptions(false)
              setError('')
            }}
            className="option-button"
          >
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
                  <li key={index} className="wallet-item">
                    <button
                      onClick={() => loadWallet(wallet)}
                      className="wallet-select-button"
                    >
                      {wallet.ethAddress}
                    </button>
                    <button
                      onClick={() => deleteWallet(wallet)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      ) : showPasswordForm ? (
        <div className="password-form">
          <h2>{showImportForm ? 'Import Wallet' : 'Create New Wallet'}</h2>
          {showImportForm && (
            <>
              <p>Enter your 12-word seed phrase to recover your wallet:</p>
              <textarea
                value={importSeedPhrase}
                onChange={(e) => setImportSeedPhrase(e.target.value.trim())}
                placeholder="Enter your 12-word seed phrase (e.g., word1 word2 ... word12)"
                rows="3"
                className="seed-input"
              />
            </>
          )}
          <p>
            {showImportForm
              ? 'Set a password for this wallet:'
              : 'Set a password to protect your wallet:'}
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="password-input"
          />
          <div className="form-buttons">
            <button
              onClick={showImportForm ? importWallet : generateWallet}
              className="option-button"
            >
              {showImportForm ? 'Import Wallet' : 'Create Wallet'}
            </button>
            <button
              onClick={() => {
                setShowPasswordForm(false)
                setShowOptions(true)
                setShowImportForm(false)
                setPassword('')
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
      ) : showImportForm ? (
        <div className="password-form">
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
            <button
              onClick={() => {
                setShowImportForm(false)
                setShowPasswordForm(true)
                setError('')
              }}
              className="option-button"
            >
              Next
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
      ) : showViewPasswordForm ? (
        <div className="password-form">
          <h2>Enter Password</h2>
          <p>Enter the password to view wallet details:</p>
          <input
            type="password"
            value={viewPassword}
            onChange={(e) => setViewPassword(e.target.value)}
            placeholder="Enter password"
            className="password-input"
          />
          <div className="form-buttons">
            <button onClick={verifyPasswordAndView} className="option-button">
              View Wallet
            </button>
            <button
              onClick={() => {
                setShowViewPasswordForm(false)
                setShowOptions(true)
                setViewPassword('')
                setSelectedWallet(null)
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

          <button
            onClick={() => {
              setSeedPhrase('')
              setEthAddress('')
              setEthPrivateKey('')
              setEthBalance('')
              setWalletCreated(false)
              setShowOptions(true)
              setError('')
            }}
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}

export default Wallet