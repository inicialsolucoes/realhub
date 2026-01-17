import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useTranslation } from '../../context/TranslationContext';
import { Building2, TrendingUp, Clock, Search } from 'lucide-react';

export default function RevenueReport() {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [totals, setTotals] = useState({ totalPendente: 0, totalArrecadado: 0 });
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
            const { data: response } = await api.get('/reports/revenue', { params: filters });
            setData(response.data);
            setTotals(response.totals);
        } catch (error) {
            console.error('Error fetching revenue report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                <h1 className="text-2xl font-bold text-slate-800">{t('reports.revenue.title')}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card border-l-4 border-amber-500 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{t('reports.revenue.pending_total')}</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? '...' : formatCurrency(totals.totalPendente)}
                        </p>
                    </div>
                </div>

                <div className="card border-l-4 border-emerald-500 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{t('reports.revenue.total_arrecadado')}</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? '...' : formatCurrency(totals.totalArrecadado)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="card p-4">
                <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                    <div className="w-40">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Mês</label>
                        <select
                            className="input w-full text-sm"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Ano</label>
                        <select
                            className="input w-full text-sm"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary flex items-center gap-2 h-[38px]">
                        <Search className="w-4 h-4" /> {t('payments.filters.filter_button')}
                    </button>
                </form>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <th className="p-4 font-semibold">Unidade</th>
                                <th className="p-4 font-semibold text-center">{t('reports.revenue.pending_count')}</th>
                                <th className="p-4 font-semibold text-right">{t('reports.revenue.pending_total')}</th>
                                <th className="p-4 font-semibold text-center">{t('reports.revenue.paid_count')}</th>
                                <th className="p-4 font-semibold text-right">{t('reports.revenue.paid_total')}</th>
                                <th className="p-4 font-semibold text-right">{t('reports.revenue.balance')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 italic">
                                        {t('common.loading')}
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-2 py-1 rounded text-sm w-fit font-medium">
                                                <Building2 className="w-3 h-3" />
                                                <span>Q{item.quadra} L{item.lote} {item.casa ? `C${item.casa}` : ''}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-sm text-slate-500">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.qtd_pendente > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                                                {item.qtd_pendente}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-right text-sm font-bold text-amber-600`}>
                                            {formatCurrency(item.total_pendente)}
                                        </td>
                                        <td className="p-4 text-center text-sm text-slate-500">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.qtd_pago > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                {item.qtd_pago}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-right text-sm font-bold text-emerald-600`}>
                                            {formatCurrency(item.total_pago)}
                                        </td>
                                        <td className={`p-4 text-right text-sm font-bold ${parseFloat(item.total_pago) - parseFloat(item.total_pendente) < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                            {formatCurrency(parseFloat(item.total_pago) - parseFloat(item.total_pendente))}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 italic">
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
