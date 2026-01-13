import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Mail, Building2 } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';
import api from '../lib/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || t('common.error_saving') || 'Erro ao processar solicitação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                {!submitted ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold tracking-tight">RealHub</h1>
                                <p className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-medium">Residencial Costa Real 1</p>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{t('auth.forgot_password_title')}</h2>
                            <p className="text-slate-500 mt-2">{t('auth.forgot_password_subtitle')}</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.email')}</label>
                                <input
                                    type="email"
                                    className="input w-full"
                                    placeholder={t('auth.email_placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? t('auth.sending') : t('auth.send_link')}
                            </button>
                        </form>
                        <p className="mt-6 text-center text-sm text-slate-600">
                            <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.remembered_password')}</Link>
                        </p>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{t('auth.verify_email_title')}</h3>
                        <p className="text-slate-600 mb-8">
                            {t('auth.verify_email_text').replace('{email}', email)}
                        </p>
                        <Link to="/login" className="btn btn-outline w-full block">
                            {t('auth.back_to_login')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
