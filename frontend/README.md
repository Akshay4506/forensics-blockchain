# Forensic Investigative Interface (Frontend) 🎨🔍⚖️

The specialized forensic UI designed for evidentiary asset management, blockchain visualization, and integrity verification.

## 🚀 Getting Started
```bash
cd frontend
npm install
npm run dev
```

## 🛡️ Investigative UI Protocols

### 1. Sequential Form Activation 🔓灰
To ensure a guided, forensic workflow, the **Transfer Custody** and **Verify Integrity** forms use sequential activation:
*   **Disabled State**: Secondary fields (Select Evidence, Recipient Email) are initially greyed out. 🔒
*   **Prerequisite**: You must first select an investigation **Case** to "unlock" the evidence list for that specific jurisdiction.
*   **Selection Lock**: Recipient emails are only active once a valid evidence asset is selected. 🧩✨

### 2. The Hidden Block Protocol 🏆🔐
The **Ledger** and **Network Visualizer** implement a privacy-first viewing model:
*   **Authorized Segments**: Full transaction logs are visible for evidence that has **ever spent time** in your organization's custody.
*   **Hidden Segments**: Unauthorized blocks appear as "Locked Containers." You can see the block number and hashes (proving the chain is unbroken), but all transaction data is redacted to protect forensic privacy. 🛡️🕵️‍♂️

### 3. Role-Based Navigation ⚖️📍
The sidebar interface dynamically adapts to the current user's organization:
*   **ECU Officers**: Have exclusive access to the **"Create Evidence"** tools.
*   **LAB & COURT Officers**: Primary tools are **"Transfer Custody"** and **"Verify Integrity"**. The creation tools are automatically hidden to enforce separation of duties.

## 📡 Blockchain Connectivity
The frontend communicates directly with the Hardhat node on **Port 8546**. 🚀⛓️
- Ensure MetaMask is configured for: **Localhost 8546** (Chain ID: 1336).
- Use the **"Clear Activity Tab Data"** in MetaMask if you experience nonce errors after a Hardhat reset. 🧼✨

---
**Investigative Clarity First** | *Fusing Blockchain Power with Forensic User Experience.* 🔥🎨⚖️
