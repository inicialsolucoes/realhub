const ReportRepository = require('../repositories/ReportRepository');

exports.getRevenueReport = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const { month, year } = req.query;
        
        // If filters are provided, use them. If they are 'all' or empty, let repository handle it.
        const filterMonth = month === 'all' || !month ? null : month;
        const filterYear = year === 'all' || !year ? null : year;

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
                month: filterMonth ? parseInt(filterMonth) : 'all',
                year: filterYear ? parseInt(filterYear) : 'all'
            }
        });
    } catch (error) {
        console.error('Error in getRevenueReport:', error);
        res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
    }
};

exports.getExpensesReport = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const { month, year } = req.query;
        const filterMonth = month === 'all' || !month ? null : month;
        const filterYear = year === 'all' || !year ? null : year;

        const { details, totals } = await ReportRepository.getExpensesReport({ 
            month: filterMonth, 
            year: filterYear 
        });

        res.json({
            data: details,
            totals: {
                totalGasto: totals.total_gasto || 0,
                totalReceita: totals.total_receita || 0,
                totalPendente: totals.total_pendente || 0
            },
            filters: {
                month: filterMonth ? parseInt(filterMonth) : 'all',
                year: filterYear ? parseInt(filterYear) : 'all'
            }
        });
    } catch (error) {
        console.error('Error in getExpensesReport:', error);
        res.status(500).json({ message: 'Erro ao gerar relatório de gastos', error: error.message });
    }
};
