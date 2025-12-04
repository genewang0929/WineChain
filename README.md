# WineChain

## Description of the project
In the wine market, studies have shown that up to 20% of premium wines may be counterfeit, raising serious concerns about wine authenticity. Additionally, wine quality is highly dependent on storage conditions, which can be easily affected by many factors, including natural disasters, temperature fluctuations, and improper transportation. **However, current tracking and verification systems lack transparency.** This makes it difficult to follow a bottle’s full journey from winery to consumer. Therefore, there is a need for a transparent and condition resistant tracking system that can record and verify every stage of the wine supply chain.

To address this, our project proposes a **Blockchain-based Wine Supply Chain Provenance and Authenticity System (WineChain)** — a transparent and tamper-resistant tracking solution that records and verifies every stage of the wine supply chain, ensuring trust, traceability, and quality assurance.

## Dependencies or setup instructions
To get started, you'll need [Node.js v22](https://nodejs.org/) or later installed, along with [npm](https://www.npmjs.com/) as our package manager.

Install the contents of package.json: `npm install`. Make sure to run this command under root directory, backend project directory, as well as frontend project directory.


## How to use WineChain
1. Start and complie the smart contract:
    `npx hardhat compile`

2. Deploy to a local or test network:
    - Terminal 1:`npx hardhat node` start a loacal Ethereum chain, keep the terminal open
    - Terminal 2:`npx hardhat run scripts/deploy.js --network localhost` connect to local node and deploy 

3. Integrate frontend, backend and blockchain:
    - Terminal 3:`npm start` start a loacal backend server, keep the terminal open
    - Terminal 4:`npm run dev` start a loacal frontend server, keep the terminal open

4. Testing and Verification: 
`npx hardhat test`
