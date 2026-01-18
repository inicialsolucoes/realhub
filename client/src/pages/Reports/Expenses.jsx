import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useTranslation } from '../../context/TranslationContext';
import { TrendingDown, TrendingUp, Search, X, Folder, Clock, Wallet } from 'lucide-react';
import { clsx } from 'clsx';

export default function ExpensesReport() {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [totals, setTotals] = useState({ totalGasto: 0, totalReceita: 0, totalPendente: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const months = [
        { value: 1, label: 'Janeiro' },
        { value: 2, label: 'Fevereiro' },
        { value: 3, label: 'Março' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Maio' },
        { value: 6, label: 'Junho' },
        { value: 7, label: 'Julho' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Setembro' },
        { value: 10, label: 'Outubro' },
        { value: 11, label: 'Novembro' },
        { value: 12, label: 'Dezembro' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: response } = await api.get('/reports/expenses', { params: filters });
            setData(response.data);
            setTotals(response.totals);
        } catch (error) {
            console.error('Error fetching expenses report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.month, filters.year]);

    const handleFilter = (e) => {
        e.preventDefault();
        fetchData();
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">{t('reports.expenses.title')}</h1>
            </div>

            <div className="card p-4">
                <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Mês</label>
                        <select
                            className="input w-full text-sm"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        >
                            <option value="all">Todos os meses</option>
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Ano</label>
                        <select
                            className="input w-full text-sm"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            <option value="all">Todos os anos</option>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary flex items-center justify-center gap-2 h-[38px] w-full md:w-auto inline-flex">
                            <Search className="w-4 h-4" /> {t('payments.filters.filter_button')}
                        </button>
                        {(filters.month !== 'all' || filters.year !== 'all') && (
                            <button 
                                type="button" 
                                onClick={() => setFilters({ month: 'all', year: 'all' })}
                                className="btn btn-ghost text-slate-500 flex items-center gap-2 h-[38px] mt-4 !pl-0 md:!pl-3 inline-flex"
                            >
                                <X className="w-4 h-4" /> Limpar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                

                <div className="card border-l-4 border-emerald-500 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{t('reports.expenses.total_receita')}</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? '...' : formatCurrency(totals.totalReceita)}
                        </p>
                    </div>
                </div>

                <div className="card border-l-4 border-amber-500 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{t('reports.expenses.total_pendente')}</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? '...' : formatCurrency(totals.totalPendente)}
                        </p>
                    </div>
                </div>

                <div className="card border-l-4 border-red-500 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{t('reports.expenses.total_gasto')}</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? '...' : formatCurrency(totals.totalGasto)}
                        </p>
                    </div>
                </div>

                <div className={clsx(
                    "card border-l-4 flex items-center gap-4",
                    parseFloat(totals.totalReceita) - parseFloat(totals.totalGasto) >= 0 
                        ? "border-primary" 
                        : "border-red-500"
                )}>
                    <div className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        parseFloat(totals.totalReceita) - parseFloat(totals.totalGasto) >= 0 
                            ? "bg-primary/10 text-primary" 
                            : "bg-red-50 text-red-600"
                    )}>
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{t('reports.expenses.balance')}</p>
                        <p className={clsx(
                            "text-2xl font-bold",
                            parseFloat(totals.totalReceita) - parseFloat(totals.totalGasto) >= 0 
                                ? "text-slate-800" 
                                : "text-red-600"
                        )}>
                            {loading ? '...' : formatCurrency(parseFloat(totals.totalReceita) - parseFloat(totals.totalGasto))}
                        </p>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <th className="p-4 font-semibold">{t('reports.expenses.cost_center')}</th>
                                <th className="p-4 font-semibold text-center text-nowrap w-32">{t('reports.expenses.qtd_gasto')}</th>
                                <th className="p-4 font-semibold text-right text-nowrap w-32">{t('reports.expenses.total_gasto_col')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-slate-400 italic">
                                        {t('common.loading')}
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-nowrap">
                                            <div className="font-medium text-slate-700 hover:text-primary transition-colors flex items-center gap-2">
                                                <Folder className="w-4 h-4 text-slate-400" />
                                                {item.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-nowrap text-sm text-slate-500">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.qtd_gasto > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {item.qtd_gasto}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-right text-nowrap text-sm font-bold ${item.total_gasto > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                            {formatCurrency(item.total_gasto)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-slate-400 italic">
                                        Nenhum dado encontrado para este período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
