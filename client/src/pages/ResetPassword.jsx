import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Lock, CheckCircle2, Building2 } from 'lucide-react';
import api from '../lib/api';
import { useTranslation } from '../context/TranslationContext';

export default function ResetPassword() {
    const { t } = useTranslation();
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError(t('auth.password_too_short') || 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.passwords_do_not_match') || 'As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || t('auth.reset_error') || 'Erro ao redefinir senha. O link pode ter expirado.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        {t('auth.reset_success_title') || 'Senha Alterada!'}
                    </h2>
                    <p className="text-slate-500 mb-8">
                        {t('auth.reset_success_text') || 'Sua senha foi redefinida com sucesso. Você já pode acessar sua conta.'}
                    </p>
                    <Link
                        to="/login"
                        className="btn btn-primary w-full py-3"
                    >
                        {t('auth.back_to_login')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">{t('app.name')}</h1>
                        <p className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-medium">{t('condominium.name')}</p>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('auth.reset_password_title') || 'Nova Senha'}</h2>
                    <p className="text-slate-500 mt-2">{t('auth.reset_password_subtitle') || 'Escolha uma nova senha segura para sua conta.'}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block tracking-wider">
                            {t('auth.new_password') || 'Nova Senha'}
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                className="input w-full pl-12 py-3 bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-slate-700"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block tracking-wider">
                            {t('auth.confirm_new_password') || 'Confirmar Nova Senha'}
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                className="input w-full pl-12 py-3 bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-slate-700"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-3 text-lg font-semibold shadow-lg shadow-primary/20 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-3"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? t('common.saving') || 'Salvando...' : t('auth.reset_submit') || 'Alterar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
