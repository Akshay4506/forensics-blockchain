export const generateHash = async (textOrBuffer) => {
    let data;
    if (typeof textOrBuffer === 'string') {
        const encoder = new TextEncoder();
        data = encoder.encode(textOrBuffer);
    } else {
        data = textOrBuffer; // ArrayBuffer
    }
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};
