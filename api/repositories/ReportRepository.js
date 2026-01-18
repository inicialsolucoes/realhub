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

    async getExpensesReport(filters = {}) {
        const { month, year } = filters;
        
        let joinConditions = [];
        let params = [];

        if (month && month !== 'all' && month !== '') {
            joinConditions.push('MONTH(p.date) = ?');
            params.push(parseInt(month));
        }
        if (year && year !== 'all' && year !== '') {
            joinConditions.push('YEAR(p.date) = ?');
            params.push(parseInt(year));
        }

        const joinClause = joinConditions.length > 0 
            ? ` AND ${joinConditions.join(' AND ')}` 
            : '';

        // Query for cost center details (expenses only)
        const detailsQuery = `
            SELECT 
                cc.id,
                cc.name,
                COUNT(p.id) as qtd_gasto,
                IFNULL(SUM(p.amount), 0) as total_gasto
            FROM cost_centers cc
            LEFT JOIN payments p ON cc.id = p.cost_center_id 
                AND p.type = 'expense' 
                ${joinClause}
            GROUP BY cc.id
            ORDER BY cc.name ASC
        `;

        // Query for overall totals (Income vs Expense vs Pending)
        const totalsQuery = `
            SELECT 
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_gasto,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_receita,
                SUM(CASE WHEN type = 'pending' THEN amount ELSE 0 END) as total_pendente
            FROM payments p
            WHERE 1=1 
            ${month && month !== 'all' ? 'AND MONTH(date) = ?' : ''}
            ${year && year !== 'all' ? 'AND YEAR(date) = ?' : ''}
        `;
        
        const totalsParams = [];
        if (month && month !== 'all') totalsParams.push(parseInt(month));
        if (year && year !== 'all') totalsParams.push(parseInt(year));

        const [details] = await db.query(detailsQuery, params);
        const [totals] = await db.query(totalsQuery, totalsParams);

        return {
            details,
            totals: totals[0] || { total_gasto: 0, total_receita: 0, total_pendente: 0 }
        };
    }
}

module.exports = new ReportRepository();
