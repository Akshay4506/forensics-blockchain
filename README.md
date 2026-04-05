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
## 📄 License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details.

---
**Confidential Forensic Property** | *Built for Forensic Integrity and Immutable Truth.* ⚖️
