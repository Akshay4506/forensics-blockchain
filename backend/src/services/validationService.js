import { verifySignature } from '../utils/cryptoUtils.js';

const PEER_SECRETS = {
    ECU: 'ecu_peer_secret_123',
    LAB: 'lab_peer_secret_456',
    COURT: 'court_peer_secret_789'
};

export const validateBlock = (block) => {
    const validTransactions = [];
    const invalidTransactions = [];

    block.transactions.forEach(tx => {
        // 1. Check if endorsement array exists
        if (!tx.endorsements || tx.endorsements.length === 0) {
            tx.status = 'INVALID';
            invalidTransactions.push(tx);
            return;
        }

        // 2. Verify each endorsement signature
        let isValid = true;
        for (let end of tx.endorsements) {
            const secret = PEER_SECRETS[end.org];
            const isSigValid = verifySignature({
                proposalId: tx.proposalId,
                actor: tx.actor,
                organization: tx.organization,
                action: tx.action,
                timestamp: tx.timestamp,
                payload: tx.payload
            }, end.signature, secret);

            if (!isSigValid) {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            tx.status = 'VALID';
            validTransactions.push(tx);
        } else {
            tx.status = 'INVALID';
            invalidTransactions.push(tx);
        }
    });

    return { validTransactions, invalidTransactions };
};
