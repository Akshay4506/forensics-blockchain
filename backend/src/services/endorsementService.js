import { signPayload } from '../utils/cryptoUtils.js';

// Simulate peer endpoints / endorsers
const PEER_SECRETS = {
    ECU: 'ecu_peer_secret_123',
    LAB: 'lab_peer_secret_456',
    COURT: 'court_peer_secret_789'
};

export const endorseTransaction = async (proposal, currentOwnerId) => {
    const { action, actor, organization } = proposal;
    let endorsements = [];

    // Endorsement Policy Simulation
    // CREATE -> Requires ECU
    // TRANSFER -> Requires currentOwner (implicit by JWT) + LAB
    // VERIFY -> Requires LAB

    try {
        if (action === 'CREATE') {
            if (organization !== 'ECU') throw new Error('Policy fail: Only ECU can CREATE');
            endorsements.push({
                org: 'ECU',
                signature: signPayload(proposal, PEER_SECRETS.ECU)
            });
        } else if (action === 'TRANSFER') {
            // Actor proposing transfer must be the current owner
            if (actor.toString() !== currentOwnerId.toString()) throw new Error('Policy fail: Only owner can TRANSFER');

            // Need LAB endorsement (simulating LAB peer approval)
            endorsements.push({
                org: 'LAB',
                signature: signPayload(proposal, PEER_SECRETS.LAB)
            });
        } else if (action === 'VERIFY') {
            if (organization !== 'LAB' && organization !== 'COURT') throw new Error('Policy fail: Only LAB/COURT can VERIFY');
            endorsements.push({
                org: organization,
                signature: signPayload(proposal, PEER_SECRETS[organization])
            });
        } else {
            throw new Error('Unknown action');
        }

        return { ...proposal, endorsements, status: 'ENDORSED' };
    } catch (error) {
        return { ...proposal, error: error.message, status: 'REJECTED' };
    }
};
