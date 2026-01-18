import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/api';

const NotificationContext = createContext();

const VAPID_PUBLIC_KEY = 'BBBq-qh-U0NtAUq1sy1SOmWBDa2Yd10KjkSos8W_FU8xyVF3DRz0EY5DRxsSXA-iD3jYuHfUoWgkxWJpyB2wY0o';

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('Push messaging is not supported');
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            
            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                const subJSON = existingSubscription.toJSON();
                setSubscription(subJSON);
                // Even if exists, update backend to ensure it's linked to current user
                await api.post('/notifications/subscribe', subJSON);
                return;
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const subJSON = sub.toJSON();
            setSubscription(subJSON);
            await api.post('/notifications/subscribe', subJSON);
            console.log('Successfully subscribed to push notifications');
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
        }
    };

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered:', reg))
                .catch(err => console.error('SW registration failed:', err));
        }
    }, []);

    useEffect(() => {
        if (user) {
            // Request permission and subscribe when user logs in
            if (Notification.permission === 'granted') {
                subscribeToPush();
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        subscribeToPush();
                    }
                });
            }
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={{ subscribeToPush, subscription }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);
