import { useState, useEffect } from 'react';
import { Building2, Wallet, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from '../context/TranslationContext';

export default function Dashboard() {
    const [statsData, setStatsData] = useState({ units: 0, residents: 0, income: 0, expense: 0, history: [] });
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        api.get('/dashboard/stats')
            .then(({ data }) => setStatsData(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatCurrencyShort = (val) => new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(val);
    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const stats = [
        { label: t('units.title'), value: statsData.units, icon: Building2, color: 'bg-blue-500' },
        { label: t('units.residents'), value: statsData.residents, icon: Users, color: 'bg-indigo-500' },
        { label: t('dashboard.income_month'), value: formatCurrency(statsData.income), icon: ArrowUpRight, color: 'bg-emerald-500' },
        { label: t('dashboard.expense_month'), value: formatCurrency(statsData.expense), icon: ArrowDownRight, color: 'bg-red-500' },
    ];

    const visibleStats = stats;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('dashboard.overview')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleStats.map((stat, index) => (
                    <div key={index} className="card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-800">
                                {loading ? '...' : stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">{t('dashboard.evolution')}</h2>
                    <div className="h-80 w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-400">{t('common.loading')}</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={statsData.history}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            const [, month] = val.split('-');
                                            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                                            return months[parseInt(month) - 1];
                                        }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `R$ ${formatCurrencyShort(val)}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val) => formatCurrency(val)}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Line
                                        name={t('payments.income')}
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        name={t('payments.expense')}
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card h-64 flex flex-col justify-center items-center text-slate-400">
                    <p>{t('dashboard.cash_flow_report_soon')}</p>
                </div>
                <div className="card h-64 flex flex-col justify-center items-center text-slate-400">
                    <p>{t('dashboard.recent_activities_soon')}</p>
                </div>
            </div>
        </div>
    );
}
