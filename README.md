# Arc Transfer

A web app for sending USDC and EURC stablecoins on Arc Testnet. Built by **wija** while exploring the Arc blockchain ecosystem.

## What it does

- Connect your wallet (MetaMask, Rabby, OKX and more)
- Send USDC or EURC to one or multiple recipients at once
- View transaction history with direct links to ArcScan explorer
- Real-time balance display for both tokens

## Built with

- [Next.js](https://nextjs.org/)
- [Wagmi](https://wagmi.sh/) + [Viem](https://viem.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Arc Testnet](https://docs.arc.network/)

## Getting started

1. Clone the repo
```bash
   git clone https://github.com/YOUR_USERNAME/arc-usdc-transfer.git
   cd arc-usdc-transfer
```

2. Install dependencies
```bash
   npm install
```

3. Add your WalletConnect Project ID in `lib/wagmi-config.js`
```js
   projectId: "YOUR_PROJECT_ID"
```

4. Run the app
```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Network

App runs on **Arc Testnet**. Get free USDC and EURC from the [Circle Faucet](https://faucet.circle.com/).

## Notes

This is a testnet app built for learning purposes. Not production ready.