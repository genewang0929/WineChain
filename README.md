# WineChain

## Description of the project
In the wine market, studies have shown that up to 20% of premium wines may be counterfeit, raising serious concerns about wine authenticity. Additionally, wine quality is highly dependent on storage conditions, which can be easily affected by many factors, including natural disasters, temperature fluctuations, and improper transportation. **However, current tracking and verification systems lack transparency.** This makes it difficult to follow a bottle’s full journey from winery to consumer. Therefore, there is a need for a transparent and condition resistant tracking system that can record and verify every stage of the wine supply chain.

To address this, our project proposes a **Blockchain-based Wine Supply Chain Provenance and Authenticity System (WineChain)** — a transparent and tamper-resistant tracking solution that records and verifies every stage of the wine supply chain, ensuring trust, traceability, and quality assurance.

## Dependencies or setup instructions
To get started with Hardhat 3, you'll need [Node.js v22](https://nodejs.org/) or later installed, along with [npm](https://www.npmjs.com/) as our package manager. For the initial prompt to for setting up the project, we chose [TypeScript](https://www.typescriptlang.org/), [Ethers.js](https://docs.ethers.org/v5/), [Mocha](https://mochajs.org/).

Install the contents of package.json: `npm install`


## How to use or deploy (incomplete details are acceptable at this stage)
1. Start and complie the smart contract:
    `npx hardhat compile`

2. Deploy to a local or test network:
    - Terminal 1:`npx hardhat node` start a loacal Ethereum chain, keep the terminal open
    - Terminal 2:`npx hardhat run scripts/deploy.js --network localhost` connect to local node and deploy 


3. Integrate frontend and blockchain:
The frontend (React) communicates with the deployed smart contract using Ethers.js
    ```
    import { ethers } from "ethers";
    import WineChainABI from "./artifacts/contracts/WineChain.sol/WineChain.json";
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractAddress = "<DEPLOYED_CONTRACT_ADDRESS>";
    const contract = new ethers.Contract(contractAddress, WineChainABI.abi, provider.getSigner());
    ```

4. Off-chain data integration:
Files are uploaded to IPFS (via Pinata API).
The returned IPFS hash is stored on-chain in the smart contract.
6. Testing and Verification: 
`npx hardhat test`