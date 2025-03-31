function WalletImportForm({
    importSeedPhrase,
    setImportSeedPhrase,
    importWallet,
    setShowImportForm,
    setShowDashboard,
    error,
  }) {
    return (
      <div className="import-form">
        <h2>Import Wallet</h2>
        <p>Enter your 12-word seed phrase to recover your wallet:</p>
        <textarea
          value={importSeedPhrase}
          onChange={(e) => setImportSeedPhrase(e.target.value)}
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
              setShowImportForm(false);
              setShowDashboard(true);
              setImportSeedPhrase('');
            }}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }
  
  export default WalletImportForm;