import crypto from 'crypto';

export const generateHash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

// Simulate peer signature using simple HMAC or fixed secret for now
export const signPayload = (payload, secret) => {
    return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
};

export const verifySignature = (payload, signature, secret) => {
    const expectedSignature = signPayload(payload, secret);
    return expectedSignature === signature;
};
