# PayPulse 💰⚡

> **Stream Salaries Every Second** - Revolutionary real-time payroll platform powered by PYUSD and Superfluid Protocol

[![ETHGlobal New Delhi 2025](https://img.shields.io/badge/ETHGlobal-New%20Delhi%202025-blue)](https://ethglobal.com/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![Powered by Superfluid](https://img.shields.io/badge/Powered%20by-Superfluid-green)](https://superfluid.finance/)
[![PYUSD Integration](https://img.shields.io/badge/PYUSD-Integrated-purple)](https://paxos.com/pyusd/)
[![Self Protocol](https://img.shields.io/badge/Self-Protocol-orange)](https://self.xyz/)
[![ENS Integration](https://img.shields.io/badge/ENS-Integrated-brightgreen)](https://ens.domains/)

## 🚀 Overview

PayPulse transforms traditional payroll by enabling **continuous salary streaming** instead of monthly payments. Employees get paid every second they work, watching their balance grow in real-time. Built on **PYUSD** (PayPal's stablecoin) and **Superfluid Protocol**, it bridges traditional finance with DeFi innovation.

### ✨ Key Features

- 🌊 **Real-time Salary Streaming** - Pay employees every second, not every month
- ⚡ **Instant Settlements** - One-click payments for bonuses and contractors  
- 💵 **PYUSD Powered** - Stable, regulated payments with PayPal integration
- 🌍 **Global Workforce** - Pay anyone, anywhere, instantly
- 📊 **Smart Analytics** - Real-time dashboards and payment tracking
- 📄 **Automated Invoicing** - PDF generation and compliance tools
- 🔗 **ENS Integration** - Send payments to human-readable addresses
- 🆔 **Self.xyz Verification** - Identity verification through QR codes

## 🎯 Problem & Solution

**Problem:** Traditional payroll systems force employees to wait weeks or months for earned wages, creating cash flow issues and limiting financial flexibility.

**Solution:** PayPulse enables continuous salary streaming where a $6,000 monthly salary becomes ~2.3 PYUSD flowing per hour, 24/7, giving employees immediate access to earned wages.

## 🏗️ Architecture

### Frontend Stack
- **Next.js 13** - React framework with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Privy** - Wallet authentication
- **React Query** - State management
- **Framer Motion** - Smooth animations

### Backend Stack
- **Node.js + Express** - RESTful API server
- **MongoDB** - Document database
- **JWT Authentication** - Secure API access
- **PDF Generation** - Automated invoice creation

### Blockchain Integration
- **Superfluid Protocol** - Streaming payment infrastructure
- **Ethers.js** - Web3 interactions
- **PYUSD/PYUSDx** - PayPal's stablecoin ecosystem
- **Custom Smart Contracts** - FlowScheduler for automation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB instance
- Ethereum wallet (MetaMask recommended)
- PYUSD tokens on Ethereum Sepolia

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/paypulse.git
cd paypulse

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SUPERTOKEN=0xA0Ef695957413E8edE3F9669ee680de306c7a980
NEXT_PUBLIC_NETWORK=sepolia

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
MONGODB_URI=mongodb://localhost:27017/paypulse
JWT_SECRET=your_jwt_secret
PRIVY_APP_SECRET=your_privy_app_secret

# Start backend server
npm start
```

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SUPERTOKEN=0xA0Ef695957413E8edE3F9669ee680de306c7a980
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/paypulse
JWT_SECRET=your_jwt_secret_here
PRIVY_APP_SECRET=your_privy_app_secret
PORT=3001
```

## 🎮 Usage Guide

### For Employers

1. **Connect Wallet** - Use Privy to connect your Ethereum wallet
2. **Add Recipients** - Enter employee wallet addresses or ENS domains
3. **Setup Streams** - Configure salary amounts and flow rates
4. **Launch Payments** - Start real-time salary streaming
5. **Monitor Analytics** - Track payments and generate reports

### For Employees

1. **Access Funds** - Withdraw earned wages anytime
2. **View History** - Track all received payments
3. **Generate Invoices** - Create professional payment records

## 💡 Key Innovations

### Real-time Streaming Engine
```typescript
// Example: $6000/month = 2.314814814 PYUSD per hour
const monthlyToHourly = (monthly: number) => {
  return (monthly / (30 * 24 * 3600)).toString(); // wei per second
};
```

### PYUSD Integration
- Native PYUSD wrapping to PYUSDx Super Tokens
- Seamless PayPal ecosystem integration
- Regulatory compliance and stability

## 🔧 Technical Details

### Superfluid Integration
```typescript
// Create salary stream
const createFlowOperation = sf.cfaV1.createFlow({
  superToken: PYUSDx_ADDRESS,
  sender: employerAddress,
  receiver: employeeAddress,
  flowRate: calculateFlowRate(salaryAmount, timeUnit)
});
```

### ENS Resolution
```typescript
// Resolve ENS to address
const resolvedAddress = await provider.resolveName("employee.eth");
```

### Self.xyz Integration
```typescript
// Generate identity QR code
const qrCode = await generateSelfQR({
  walletAddress: userAddress,
  verificationLevel: "basic"
});
```

## 📊 Smart Contract Addresses

### Ethereum Sepolia Testnet
- **PYUSD Token**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **PYUSDx Super Token**: `0xA0Ef695957413E8edE3F9669ee680de306c7a980`

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Railway/Heroku)
```bash
cd backend
npm run build
railway deploy
```

## 📈 Roadmap

### Phase 1 (Current)
- [x] Real-time salary streaming
- [x] PYUSD integration
- [x] Basic dashboard
- [x] Invoice generation

### Phase 2
- [ ] Payroll scheduling
- [ ] Multi-chain support (Base, Arbitrum)
- [ ] Mobile application
- [ ] Advanced analytics
- [ ] Enterprise features

### Phase 3
- [ ] DAO treasury integration
- [ ] Automated tax reporting
- [ ] Multi-token support


**Built with ❤️ for ETHGlobal New Delhi 2025**

*Revolutionizing payroll, one stream at a time* 🌊💰
