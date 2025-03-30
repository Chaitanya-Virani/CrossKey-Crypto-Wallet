import { useState } from 'react'
import Wallet from './components/Wallet'

function App() {
  const [walletCreated, setWalletCreated] = useState(false)

  return (
    <div className="app">
      <h1>Basic Blockchain Wallet</h1>
      <Wallet
        walletCreated={walletCreated}
        setWalletCreated={setWalletCreated}
      />
    </div>
  )
}

export default App