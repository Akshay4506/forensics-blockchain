# Forensic Operational Core (Backend) ⚙️📡🔬

The centralized forensic registry and blockchain listener that handles user authentication, evidence metadata, and immutable audit logs.

## ⚙️ Environment Variables
Create a `.env` file in the `backend` root:
```env
MONGO_URI=mongodb://127.0.0.1:27017/forensic_fabric
JWT_SECRET=your_secret_key
PORT=5000
```

## 📡 Hybrid Forensic Sync
The platform uses a **Persistent-First** database strategy. 
*   **Startup**: The server **does not** automatically restore deleted records from the blockchain. This allows for manual forensic management.
*   **Manual Audit**: To perform a deep-level reconciliation and restore any missing blockchain records to the database, run:
    ```bash
    npm run sync:ledger
    ```
    This command will scan all **EvidenceMinted** events on-chain and rebuild the database registry. 🕵️‍♂️⛓️🧬

## 🛠️ Infrastructure Setup

### 1. Hardhat Node (Blockchain)
The forensic smart contracts must be running on **Port 8546** with Chain ID **1336**:
```bash
npx hardhat node --config hardhat.config.js --port 8546
```

### 2. Manual Deployment
If you make changes to the Forensic Smart Contracts:
```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

## ⚖️ Forensic Controllers
*   **`evidenceController.js`**: Enforces ECU-only minting and jurisdictional visibility.
*   **`ledgerController.js`**: Manages the **Hidden Block** masking and historical audit trails.
*   **`notificationController.js`**: Triggers real-time alerts for custody handovers.

---
**Technical Integrity First** | *Ensuring a Stable Forensic Gateway.* 🛡️⚙️
