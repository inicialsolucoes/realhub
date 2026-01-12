import { createContext, useContext, useCallback } from 'react';
import translation from '../locales/translation.json';

const TranslationContext = createContext({});

export const TranslationProvider = ({ children }) => {
    const t = useCallback((key) => {
        const keys = key.split('.');
        let result = translation;

        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                return key; // Return key if not found
            }
        }

        return result;
    }, []);

    return (
        <TranslationContext.Provider value={{ t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => useContext(TranslationContext);
