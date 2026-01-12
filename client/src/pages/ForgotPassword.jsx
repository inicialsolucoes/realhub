import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                {!submitted ? (
                    <>
                        <div className="mb-8">
                            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> {t('auth.back_to_login')}
                            </Link>
                            <h2 className="text-2xl font-bold text-slate-800">{t('auth.forgot_password_title')}</h2>
                            <p className="text-slate-500 mt-2">{t('auth.forgot_password_subtitle')}</p>
                        </div>

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
