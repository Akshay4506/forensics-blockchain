/**
 * Normalizes an evidence title to enforce fuzzy uniqueness.
 * Examples:
 * - "evd1"         -> "evd1"
 * - "EVD1"         -> "evd1"
 * - "evd01"        -> "evd1"
 * - "evd_01"       -> "evd1"
 * - "Case-02_Evd3" -> "case2evd3"
 */
export const normalizeEvidenceTitle = (title) => {
    if (!title) return '';
    
    // 1. Convert to lowercase
    let norm = title.toLowerCase();
    
    // 2. Remove all non-alphanumeric characters (including spaces, underscores, etc.)
    norm = norm.replace(/[^a-z0-9]/g, '');
    
    // 3. Remove leading zeros from all numeric sequences
    // Matches zero sequences following a non-digit or at the start of the string,
    // only if they are followed by another digit.
    norm = norm.replace(/(^|(?<=[a-z]))0+(?=[0-9])/g, '');
    
    return norm;
};
