

function WalletDetails({
    seedPhrase,
    ethAddress,
    ethPrivateKey,
    ethBalance,
    network,
    setNetwork,
    setWalletCreated,
    setShowDashboard,
    setError,
  }) {

    const shortenAddress = (address) => {
    if (!address || address.length < 11) return address;
    return `${address.slice(0, 6)}......${address.slice(-5)}`;
  };
    return (
        <>
        <div className="wallet-detail">
        <div className="network-section">
          <select
            id="network-select"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="network-dropdown"
          >
            <option value="sepolia">Ethereum (Sepolia Testnet)</option>
            <option value="amoy">Polygon (Amoy Testnet)</option>
          </select>
          </div>

        <div className="address-section">
        <p> {shortenAddress(ethAddress)}</p>
        </div>

        <div className="balance-section">
          <p>
            Balance:{' '}
            {ethBalance
              ? `${ethBalance} ${network === 'sepolia' ? 'ETH' : 'POL'}`
              : 'Loading...'}
          </p>
          </div>

      <div className="wallet-info">
        <h2>Wallet Details</h2>
        <div className="wallet-section">
          <h3>Seed Phrase (12 words)</h3>
          <p>{seedPhrase}</p>
        </div>
       
          
         
          {/* <p>Private Key: {ethPrivateKey}</p> */}
          
       
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
      </div>
      </>
    );
  }
  
  export default WalletDetails;