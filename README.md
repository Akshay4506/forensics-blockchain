# Forensic Custody Blockchain Platform 🛡️⚖️⛓️

A high-fidelity, rule-based chain-of-custody platform built on **Ethereum/Hardhat** and **Node.js/MongoDB**. This system ensures that forensic evidence is immutable, audit-trailed, and follows strict jurisdictional protocols.

## 🏹 The Forensic Protocol
The platform enforces a mandatory transfer path to ensure legal integrity:
*   **ECU (Evidence Collection Unit)**: The **Primary Authority**. Only the ECU can mint new evidence.
*   **LAB (Forensic Laboratory)**: Responsible for analysis and integrity verification. Assets must route through the LAB before reaching the COURT.
*   **COURT (Legal Review)**: Final custody point for judicial review and evidence preservation.

### 🛡️ Core Security Features
*   **ECU-Only Minting**: Evidence can only be registered by authorized collection units. 🏛️⛓️
*   **Sequential Transfer Gates**: 
    - `ECU` ➡️ `LAB` ➡️ `COURT` (Authorized Path)
    - `ECU` ➡️ `COURT` (Blocked: Requires Lab Endorsement)
*   **Jurisdictional Privacy**: Organizations only see evidence currently or previously in their custody.
*   **Hidden Block Protocol**: Unauthorized chain segments are shown as "Locked Placeholders" to preserve blockchain continuity without leaking sensitive data. 🏆🔐

## 📡 Architecture
- **Blockchain**: Hardhat Node (Port 8546) using `ethers.js`.
- **Database**: MongoDB (Persistent Storage) for metadata and audit logs.
- **Sync**: Hybrid reconciliation that maintains database persistence while allowing manual ledger audits.

## 🚀 Quick Start
1.  **Infrastructure**: Ensure your local MongoDB instance is running.
2.  **Blockchain**:
    ```bash
    cd backend
    npx hardhat node --port 8546
    ```
3.  **Backend**:
    ```bash
    cd backend
    npm run dev
    ```
4.  **Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
---
## 🦊 MetaMask Setup
To interact with the Forensic DApp, you must configure MetaMask to connect to the local Hardhat blockchain.

1.  **Network Configuration**:
    - **Network Name**: Localhost 8546 (or Forensic Node)
    - **New RPC URL**: `http://127.0.0.1:8546`
    - **Chain ID**: `31337` (Default Hardhat Chain ID)
    - **Currency Symbol**: `ETH`

2.  **Import Officer/Node Accounts**:
    - When you start the Hardhat node (`npx hardhat node ...`), it will output 20 accounts with their Private Keys.
    - Copy a Private Key from the terminal and import it into MetaMask (Account -> Import Account).
    - Use this account to sign transactions on the platform.

---
## 📄 License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details.

---
**Confidential Forensic Property** | *Built for Forensic Integrity and Immutable Truth.* ⚖️
