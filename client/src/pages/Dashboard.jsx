import { useState, useEffect } from 'react';
import { Building2, Wallet, Users, ArrowUpRight, ArrowDownRight, Clock, Plus, Edit2, Trash2, LogIn, Key, UserPlus, LogOut } from 'lucide-react';
import api from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from '../context/TranslationContext';

export default function Dashboard() {
    const [statsData, setStatsData] = useState({ units: 0, residents: 0, income: 0, expense: 0, history: [] });
    const [activities, setActivities] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activitiesRes, paymentsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/activity-logs'),
                    api.get('/dashboard/latest-payments')
                ]);
                setStatsData(statsRes.data);
                setActivities(activitiesRes.data);
                setPayments(paymentsRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                <div className="card max-h-[400px] overflow-hidden flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" /> {t('dashboard.recent_payments')}
                    </h2>
                    <div className="flex-1 overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[300px]">
                            <thead>
                                <tr className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-50">
                                    <th className="pb-2 font-bold min-w-24 w-24">{t('payments.table.date')}</th>
                                    <th className="pb-2 font-bold">{t('payments.table.cost_center')}</th>
                                    <th className="pb-2 font-bold min-w-20 w-20">{t('payments.table.type')}</th>
                                    <th className="pb-2 font-bold text-right min-w-32 w-32">{t('payments.table.amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payments.length > 0 ? (
                                    payments.map((payment, idx) => (
                                        <tr key={idx} className="text-sm">
                                            <td className="py-3 text-slate-500 whitespace-nowrap">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 text-slate-700 font-medium truncate max-w-[120px]">
                                                {payment.cost_center_name || '-'}
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${payment.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                                                        payment.type === 'expense' ? 'bg-red-50 text-red-600' :
                                                            'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {payment.type === 'income' ? t('payments.income') :
                                                        payment.type === 'expense' ? t('payments.expense') :
                                                            t('payments.pending')}
                                                </span>
                                            </td>
                                            <td className={`py-3 text-right font-bold ${payment.type === 'income' ? 'text-emerald-600' :
                                                    payment.type === 'expense' ? 'text-red-600' :
                                                        'text-amber-600'
                                                }`}>
                                                {formatCurrency(payment.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-slate-400">
                                            {t('payments.table.no_results')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card max-h-[400px] overflow-hidden flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> {t('dashboard.recent_activities')}
                    </h2>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity) => {
                                const getActionInfo = (action) => {
                                    switch (action) {
                                        case 'CREATE': return { icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-50' };
                                        case 'UPDATE': return { icon: Edit2, color: 'text-blue-500', bg: 'bg-blue-50' };
                                        case 'DELETE': return { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50' };
                                        case 'LOGIN': return { icon: LogIn, color: 'text-indigo-500', bg: 'bg-indigo-50' };
                                        case 'LOGOUT': return { icon: LogOut, color: 'text-slate-500', bg: 'bg-slate-50' };
                                        case 'REGISTER': return { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50' };
                                        case 'FORGOT_PASSWORD_REQUEST': return { icon: Key, color: 'text-amber-500', bg: 'bg-amber-50' };
                                        default: return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50' };
                                    }
                                };
                                const info = getActionInfo(activity.action);
                                return (
                                    <div key={activity.id} className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${info.bg} ${info.color}`}>
                                            <info.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 leading-tight">
                                                <span className="font-bold text-slate-900">{activity.user_name || t('common.system')}</span>
                                                {' '}{activity.action.toLowerCase().replace(/_/g, ' ')}
                                                {activity.entity_type && <span className="text-slate-500"> {t(`entities.${activity.entity_type}`)}</span>}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                                {new Date(activity.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center text-slate-400 py-12">
                                <Clock className="w-12 h-12 mb-2 opacity-20" />
                                <p>{t('dashboard.no_recent_activities')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
