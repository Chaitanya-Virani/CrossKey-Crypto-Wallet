function WalletImportForm({
  importSeedPhrase,
  setImportSeedPhrase,
  importWallet,
  setShowImportForm,
  setShowDashboard,
  error,
}) {
  const handleImport = () => {
    console.log('Import button clicked, seed phrase:', importSeedPhrase);
    importWallet();
  };

  return (
    <div className="import-form">
      <h2>Import Wallet</h2>
      <p>Enter your 12-word seed phrase below (separated by spaces):</p>
      <textarea
        value={importSeedPhrase}
        onChange={(e) => setImportSeedPhrase(e.target.value)}
        placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
        className="seed-input"
        rows="3"
      />
      <div className="form-buttons">
        <button onClick={handleImport} className="option-button">
          Import Wallet
        </button>
        <button
          onClick={() => {
            setShowImportForm(false);
            setShowDashboard(true);
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