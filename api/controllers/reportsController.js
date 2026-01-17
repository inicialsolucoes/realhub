// DEBUG: V02
const ReportRepository = require('../repositories/ReportRepository');

exports.getRevenueReport = async (req, res) => {
    console.log('--- DEBUG: getRevenueReport called ---');
    console.log('req.userRole:', req.userRole);
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const { month, year } = req.query;
        
        // Use current date if not provided?
        const now = new Date();
        const filterMonth = month || (now.getMonth() + 1);
        const filterYear = year || now.getFullYear();

        const data = await ReportRepository.getRevenueReport({ 
            month: filterMonth, 
            year: filterYear 
        });

        // Calculate totals for the boxes
        const totalPendente = data.reduce((sum, item) => sum + parseFloat(item.total_pendente), 0);
        const totalArrecadado = data.reduce((sum, item) => sum + parseFloat(item.total_pago), 0);

        res.json({
            data,
            totals: {
                totalPendente,
                totalArrecadado
            },
            filters: {
                month: parseInt(filterMonth),
                year: parseInt(filterYear)
            }
        });
    } catch (error) {
        console.error('Error in getRevenueReport:', error);
        res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
    }
};
