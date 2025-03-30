import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

function PasswordManager({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [error, setError] = useState('');

  // Check for existing password on mount
  useEffect(() => {
    const storedPassword = localStorage.getItem('walletPassword');
    if (storedPassword) {
      setIsPasswordSet(true);
      setShowPasswordLogin(true);
    } else {
      setShowPasswordSetup(true); // Always prompt for password setup if no password exists
    }
  }, []);

  // Handle password setup
  const handlePasswordSetup = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    const hashedPassword = CryptoJS.SHA256(password).toString();
    localStorage.setItem('walletPassword', hashedPassword);
    setIsPasswordSet(true);
    setShowPasswordSetup(false);
    setPassword('');
    setError('');
    onUnlock(); // Proceed to wallet interface
  };

  // Handle password login
  const handlePasswordLogin = () => {
    const storedPassword = localStorage.getItem('walletPassword');
    const hashedInputPassword = CryptoJS.SHA256(password).toString();
    if (hashedInputPassword === storedPassword) {
      setShowPasswordLogin(false);
      setPassword('');
      setError('');
      onUnlock(); // Proceed to wallet interface
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="password-container">
      {showPasswordSetup ? (
        <div className="password-setup">
          <h2>Set Up Password</h2>
          <p>Please set a password to protect your wallet on this device.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password (min 6 characters)"
            className="password-input"
          />
          <button onClick={handlePasswordSetup} className="option-button">
            Set Password
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      ) : showPasswordLogin ? (
        <div className="password-login">
          <h2>Enter Password</h2>
          <p>Please enter your password to access your wallet.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="password-input"
          />
          <button onClick={handlePasswordLogin} className="option-button">
            Unlock
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      ) : null}
    </div>
  );
}

export default PasswordManager;