const db = require('../db');

class ReportRepository {
    async getRevenueReport(filters = {}) {
        const { month, year } = filters;
        
        let whereConditions = [];
        let params = [];

        if (month && month !== 'all' && month !== '') {
            whereConditions.push('MONTH(p.date) = ?');
            params.push(parseInt(month));
        }
        if (year && year !== 'all' && year !== '') {
            whereConditions.push('YEAR(p.date) = ?');
            params.push(parseInt(year));
        }

        const whereClause = whereConditions.length > 0 
            ? ` AND ${whereConditions.join(' AND ')}`
            : '';

        const query = `
            SELECT 
                u.id,
                u.quadra,
                u.lote,
                u.casa,
                COUNT(CASE WHEN p.type = 'pending' THEN 1 END) as qtd_pendente,
                IFNULL(SUM(CASE WHEN p.type = 'pending' THEN p.amount ELSE 0 END), 0) as total_pendente,
                COUNT(CASE WHEN p.type = 'income' THEN 1 END) as qtd_pago,
                IFNULL(SUM(CASE WHEN p.type = 'income' THEN p.amount ELSE 0 END), 0) as total_pago
            FROM payments p
            LEFT JOIN units u ON u.id = p.unit_id 
            WHERE p.type <> 'expense' ${whereClause}
            GROUP BY u.id
            ORDER BY u.quadra ASC, u.lote ASC, u.casa ASC
        `;

        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = new ReportRepository();
