export const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
    });
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    // Check if it's a date-only string (midnight UTC)
    // When serialized from a MySQL DATE, it usually comes as T00:00:00.000Z
    const isMidnightUTC = typeof dateString === 'string' && dateString.includes('T00:00:00.000Z');

    return date.toLocaleDateString('pt-BR', {
        timeZone: isMidnightUTC ? 'UTC' : 'America/Sao_Paulo'
    });
};
