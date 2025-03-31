import WalletList from './WalletList';

function WalletDashboard({
  generateWallet,
  setShowImportForm,
  setShowDashboard,
  existingWallets,
  setEthAddress,
  setSeedPhrase,
  setEthPrivateKey,
  setWalletCreated,
  setError,
  deleteWallet,
  error,
}) {
  return (
    <>
    
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
        <WalletList
          existingWallets={existingWallets}
          loadWallet={(wallet) => {
            setSeedPhrase(wallet.seedPhrase);
            setEthAddress(wallet.ethAddress);
            setEthPrivateKey(wallet.ethPrivateKey);
            setWalletCreated(true);
            setShowDashboard(false);
            setError('');
          }}
          deleteWallet={deleteWallet}
        />
      )}
      {error && <p className="error">{error}</p>}
    </div>
    </>
  );
}

export default WalletDashboard;