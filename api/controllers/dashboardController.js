const db = require('../db');

exports.getStats = async (req, res) => {
    try {
        const [units] = await db.query('SELECT COUNT(*) as total FROM units');
        const [users] = await db.query('SELECT COUNT(*) as total FROM users WHERE unit_id IS NOT NULL');

        // Month Income/Expense
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const [income] = await db.query(`
            SELECT SUM(amount) as total 
            FROM payments 
            WHERE type = 'income' 
            AND MONTH(date) = ? 
            AND YEAR(date) = ?
        `, [currentMonth, currentYear]);

        const [expense] = await db.query(`
            SELECT SUM(amount) as total 
            FROM payments 
            WHERE type = 'expense' 
            AND MONTH(date) = ? 
            AND YEAR(date) = ?
        `, [currentMonth, currentYear]);

        // Last 12 months history
        const historyQuery = `
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM payments
            WHERE date >= DATE_SUB(LAST_DAY(NOW()), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month ASC
        `;
        const [history] = await db.query(historyQuery);

        res.status(200).send({
            units: units[0].total,
            residents: users[0].total,
            income: income[0].total || 0,
            expense: expense[0].total || 0,
            history: history
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getActivities = async (req, res) => {
    try {
        const query = `
            SELECT al.*, u.name as user_name 
            FROM activity_logs al 
            LEFT JOIN users u ON al.user_id = u.id 
            ORDER BY al.created_at DESC 
            LIMIT 10
        `;
        const [rows] = await db.query(query);
        res.status(200).send(rows);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getLatestPayments = async (req, res) => {
    try {
        const query = `
            SELECT p.date, p.type, p.amount, c.name as cost_center_name 
            FROM payments p 
            LEFT JOIN cost_centers c ON p.cost_center_id = c.id 
            ORDER BY p.date DESC 
            LIMIT 10
        `;
        const [rows] = await db.query(query);
        res.status(200).send(rows);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
