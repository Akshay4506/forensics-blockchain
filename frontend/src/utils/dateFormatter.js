export const formatIST = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const formatted = date.toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).toUpperCase();
    return `${formatted} IST`;
};
