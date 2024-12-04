export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const escapeSqlString = (text) => {
    if (!text) return '';

    return text
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
};

export const sqlValueOrNull = (value) => value ? `'${escapeSqlString(value)}'` : 'NULL';

