const db = require('../db');

class ReportRepository {
    async getRevenueReport(filters = {}) {
        const { month, year } = filters;
        
        let query = `
            SELECT 
                u.id,
                u.quadra,
                u.lote,
                u.casa,
                COUNT(CASE WHEN p.type = 'pending' THEN 1 END) as qtd_pendente,
                IFNULL(SUM(CASE WHEN p.type = 'pending' THEN p.amount ELSE 0 END), 0) as total_pendente,
                COUNT(CASE WHEN p.type = 'income' THEN 1 END) as qtd_pago,
                IFNULL(SUM(CASE WHEN p.type = 'income' THEN p.amount ELSE 0 END), 0) as total_pago
            FROM units u
            LEFT JOIN payments p ON u.id = p.unit_id
        `;

        let conditions = [];
        let params = [];

        if (month) {
            conditions.push('MONTH(p.date) = ?');
            params.push(month);
        }
        if (year) {
            conditions.push('YEAR(p.date) = ?');
            params.push(year);
        }

        const filterMonth = parseInt(month);
        const filterYear = parseInt(year);

        query = `
            SELECT 
                u.id,
                u.quadra,
                u.lote,
                u.casa,
                COUNT(CASE WHEN p.type = 'pending' THEN 1 END) as qtd_pendente,
                IFNULL(SUM(CASE WHEN p.type = 'pending' THEN p.amount ELSE 0 END), 0) as total_pendente,
                COUNT(CASE WHEN p.type = 'income' THEN 1 END) as qtd_pago,
                IFNULL(SUM(CASE WHEN p.type = 'income' THEN p.amount ELSE 0 END), 0) as total_pago
            FROM units u
            LEFT JOIN payments p ON u.id = p.unit_id 
                AND MONTH(p.date) = ? 
                AND YEAR(p.date) = ?
            GROUP BY u.id
            ORDER BY u.quadra ASC, u.lote ASC, u.casa ASC
        `;
        params = [filterMonth, filterYear];

        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = new ReportRepository();
