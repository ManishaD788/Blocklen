# 🤖 AI-Based Smart Contract Auditor (Web3 Web App)

An interactive platform built with Next.js and Tailwind CSS that allows users to upload Solidity smart contracts and instantly receive an AI-powered audit. 

Powered by the **Groq LLM (Llama 3.3 70B)**, the app scans the contract code and returns a structured output featuring:
- **Overall Risk Score** (0-100)
- **Critical Vulnerabilities** (e.g., Reentrancy, Unchecked External Calls)
- **Gas Inefficiencies** (e.g., Uncached array lengths, poor loop optimization)
- **Actionable Suggestions** for writing safer, more optimized code

As a final step, users can **store the hash of their audit results permanently on the Sepolia Testnet** via MetaMask, providing a verifiable "Proof of Audit".

---

## 🚀 Features

- **Blazing Fast AI Auditing:** Utilizes the high-speed Groq inference engine to return deep code analysis in seconds.
- **Dynamic Risk Evaluation:** Intelligent scoring that dynamically adjusts based on the exact syntax and code logic provided. 
- **Web3 Integration:** Connects seamlessly with MetaMask via `ethers.js` to anchor audit completion proofs on the Ethereum Sepolia testnet.
- **Clean UI:** A modern, dark-themed responsive user interface built using Tailwind CSS, `lucide-react`, and `framer-motion` (optional animations).

---

## 🛠 Prerequisites

Before cloning and running the project, ensure you have the following installed:
1. **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
2. **[MetaMask Wallet Extension](https://metamask.io/)** (configured to the **Sepolia Testnet** with some test Sepolia ETH).
3. **[Groq API Key](https://console.groq.com/keys)** (Free API key required for the AI Engine).

---

## 📦 Local Setup & Installation

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/blocklen.git
cd blocklen
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables (.env Setup)
Create a new file in the root directory named \`.env.local\`. Add your Groq API Key to this file:
\`\`\`env
# .env.local
GROQ_API_KEY=your_actual_groq_api_key_here
\`\`\`
*(Note: Never commit your real API keys to GitHub. The \`.gitignore\` file is pre-configured to ignore \`.env.local\`)*

### 4. Deploy the Smart Contract
To enable the "Save Audit Proof to Sepolia Testnet" feature, you must deploy your own instance of the storage contract.
1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create a new file called \`AuditStorage.sol\` and paste the contents of the \`contracts/AuditStorage.sol\` file from this repository.
3. Compile the contract using Solidity compiler `^0.8.19`.
4. Navigate to the **Deploy & Run Transactions** tab.
5. Set the Environment to **Injected Provider - MetaMask**. Ensure your MetaMask is currently on the Sepolia network.
6. Click **Deploy** and confirm the transaction in your wallet.
7. Once deployed, **copy the deployed Contract Address** at the bottom left panel.

### 5. Link Contract to the Frontend
Open the \`src/app/page.tsx\` file in your code editor. Locate `line 8` and replace the placeholder with your copied smart contract address:
\`\`\`typescript
// src/app/page.tsx
const CONTRACT_ADDRESS = "0xYOUR_NEWLY_DEPLOYED_CONTRACT_ADDRESS_HERE";
\`\`\`

### 6. Run the Application
Start the Next.js development server:
\`\`\`bash
npm run dev
\`\`\`
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to start auditing

---

## 🔐 About the AI Model & Fallbacks
This application uses a prompt structure instructing the Llama 3.3 70B model to strictly format responses. Depending on the snippet provided, the model dynamically calculates risk scores and finds issues. **There are no hardcoded vulnerability results.** The insights you receive adjust completely based on the exact Solidity code you enter.

## 🤝 Contributing
Pull requests are welcome, If you'd like to improve the UI, add support for more AI models, or expand the Solidity storage contract capabilities, feel free to fork the repository and submit a PR.

## 📄 License
This project is licensed under the MIT License.
