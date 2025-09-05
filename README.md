# Crypto Wallet Extension

A Chrome extension for managing Ethereum (Sepolia Testnet) and Polygon (Amoy Testnet) wallets. Built with React and Vite.

## Features

- **Password Protection:** Secure your wallet with a password.
- **Create Wallet:** Generate a new wallet with a 12-word seed phrase.
- **Import Wallet:** Restore wallets using a seed phrase.
- **View Details:** See wallet address, balance, and seed phrase.
- **Transfer Funds:** Send ETH/POL to other addresses.
- **Manage Multiple Wallets:** Switch and delete wallets.
- **Network Support:** Ethereum Sepolia and Polygon Amoy testnets.
- **Explorer Links:** View transactions on Etherscan or Polygonscan.

## Getting Started

### Prerequisites

- Node.js and npm installed

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

### Build for Chrome Extension

```sh
npm run build
```

The output will be in the `dist/` folder. Load this folder as an unpacked extension in Chrome.

### Environment Variables

Set your Infura API key in `.env`:

```
VITE_INFURA_API_KEY=your_infura_project_id
```

### Folder Structure

- `src/components/`: React components for wallet UI
- `src/utils/`: Wallet logic and balance fetching
- `public/`: Icons and assets
- `manifest.json`: Chrome extension manifest

### Security

- Password is hashed before storage.
- Wallets are stored in localStorage (not encrypted).
- For production, encrypt wallet data and improve security.

### License

MIT

---

## Credits

- [ethers.js](https://docs.ethers.org/)
- [Ant Design](https://ant.design/)
- [React](https://react.dev/)
