import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, Clock, User as UserIcon, Activity, Globe, Info } from 'lucide-react';
import { useTranslation } from '../../context/TranslationContext';
import { formatDateTime } from '../../utils/date';

export default function LogDetails() {
    const { id } = useParams();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const { data } = await api.get(`/activity-logs/${id}`);
                setLog(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLog();
    }, [id]);

    if (loading) return <div className="p-8">{t('common.loading')}</div>;
    if (!log) return <div className="p-8">Log não encontrado.</div>;

    const getDetails = () => {
        if (!log.details) return {};
        if (typeof log.details === 'object') return log.details;
        try {
            return JSON.parse(log.details);
        } catch (e) {
            return {};
        }
    };

    const details = getDetails();

    const keyMap = {
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone',
        role: 'Perfil',
        unit_id: 'ID Unidade',
        quadra: 'Quadra',
        lote: 'Lote',
        casa: 'Casa',
        observacao: 'Observação',
        date: 'Data',
        amount: 'Valor',
        type: 'Tipo',
        description: 'Descrição',
        cost_center_id: 'ID Centro de Custo',
        proof: 'Comprovante',
        cost_center_ids: 'IDs Centros de Custo',
        password: 'Senha (Criptografada)',
        is_paid: 'Pago',
        status: 'Status',
        created_at: 'Criado em',
        updated_at: 'Atualizado em',
        deleted_at: 'Excluído em'
    };

    const formatValue = (val) => {
        if (val === null || val === undefined) return '-';
        if (typeof val === 'object') return JSON.stringify(val, null, 2);
        if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
        return String(val);
    };

    // Determine rows based on action
    let rows = [];
    if (log.action === 'UPDATE' && details.old && details.new) {
        const allKeys = Array.from(new Set([...Object.keys(details.old), ...Object.keys(details.new)]));
        rows = allKeys.map(key => ({
            attribute: keyMap[key] || key,
            old: details.old[key],
            new: details.new[key]
        }));
    } else if (log.action === 'CREATE') {
        rows = Object.entries(details).map(([key, val]) => ({
            attribute: keyMap[key] || key,
            old: null,
            new: val
        }));
    } else if (log.action === 'DELETE') {
        rows = Object.entries(details).map(([key, val]) => ({
            attribute: keyMap[key] || key,
            old: val,
            new: null
        }));
    } else {
        // Fallback for LOGIN, LOGOUT etc or simple creations
        rows = Object.entries(details).map(([key, val]) => ({
            attribute: keyMap[key] || key,
            old: '-',
            new: val
        }));
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <Link to="/logs" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" /> {t('common.back')}
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        {t('logs.details.title')}
                        <span className={`text-sm px-2 py-1 rounded-lg uppercase tracking-wider ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-700'
                            }`}>
                            {log.action}
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-1">{t(`entities.${log.entity_type}`)} #{log.entity_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" /> {t('logs.details.metadata')}
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-slate-500 text-sm flex items-center gap-2"><UserIcon className="w-4 h-4" /> {t('logs.table.user')}</span>
                            <span className="font-semibold text-slate-800">{log.user_name || t('common.system')}</span>
                        </div>
                         <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-slate-500 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> {t('logs.table.date')}</span>
                            <span className="font-medium text-slate-700">{formatDateTime(log.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-slate-500 text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> IP Address</span>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{log.ip_address}</span>
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> {t('logs.details.impact')}
                    </h3>
                    <div className="flex flex-col gap-2">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-2 tracking-wide">{t('logs.table.action')}</p>
                            <p className="text-slate-700 text-sm">
                                {log.user_name || t('common.system')} realizou a ação <strong>{log.action}</strong> na entidade <strong>{t(`entities.${log.entity_type}`)}</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card space-y-4 overflow-hidden">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" /> {t('logs.details.data')}
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest">
                                <th className="p-3 font-bold">{t('logs.details.attribute')}</th>
                                <th className="p-3 font-bold">{t('logs.details.old_state')}</th>
                                <th className="p-3 font-bold">{t('logs.details.new_state')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {rows.map((row, idx) => {
                                const isChanged = JSON.stringify(row.old) !== JSON.stringify(row.new);
                                return (
                                    <tr key={idx} className={isChanged ? 'bg-amber-50/30' : ''}>
                                        <td className="p-3 align-top">
                                            <span className={`text-xs font-bold uppercase tracking-tighter ${isChanged ? 'text-amber-700' : 'text-slate-400'}`}>
                                                {row.attribute}
                                            </span>
                                        </td>
                                        <td className="p-3 align-top">
                                            <pre className="text-[11px] text-slate-500 whitespace-pre-wrap font-mono">
                                                {formatValue(row.old)}
                                            </pre>
                                        </td>
                                        <td className="p-3 align-top">
                                            <pre className={`text-[11px] whitespace-pre-wrap font-mono ${isChanged ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                                                {formatValue(row.new)}
                                            </pre>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function History(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    );
}
