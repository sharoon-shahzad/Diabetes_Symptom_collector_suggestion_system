import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllSettings } from '../utils/api';

const SettingsContext = createContext({
    siteTitle: 'DiabetesCare',
    contactEmail: 'support@diabetescare.com',
    siteDescription: 'Comprehensive diabetes management and symptom tracking system',
    dateFormat: 'DD MMMM, YYYY',
    loading: true,
    refreshSettings: () => {},
});

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        siteTitle: 'DiabetesCare',
        contactEmail: 'support@diabetescare.com',
        siteDescription: 'Comprehensive diabetes management and symptom tracking system',
        dateFormat: 'DD MMMM, YYYY',
    });
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            // Fetch public settings (site_title doesn't need auth)
            // For now, we'll use defaults and update when user logs in
            const siteTitle = localStorage.getItem('site_title') || 'DiabetesCare';
            const contactEmail = localStorage.getItem('contact_email') || 'support@diabetescare.com';
            const siteDescription = localStorage.getItem('site_description') || 'Comprehensive diabetes management and symptom tracking system';
            const dateFormat = localStorage.getItem('date_format') || 'DD MMMM, YYYY';
            
            setSettings({
                siteTitle,
                contactEmail,
                siteDescription,
                dateFormat,
            });
        } catch (error) {
            console.log('Using default settings');
        } finally {
            setLoading(false);
        }
    };

    const refreshSettings = async () => {
        if (!localStorage.getItem('accessToken')) {
            // Not authenticated, use defaults
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            
            // Fetch all settings from single document
            const response = await fetchAllSettings();

            if (response.success && response.data) {
                const data = response.data;
                const newSettings = {
                    siteTitle: data.site_title || 'DiabetesCare',
                    contactEmail: data.contact_email || 'support@diabetescare.com',
                    siteDescription: data.site_description || 'Comprehensive diabetes management and symptom tracking system',
                    dateFormat: data.date_format || 'DD MMMM, YYYY',
                };

                setSettings(newSettings);
                
                // Cache in localStorage for faster loads
                localStorage.setItem('site_title', newSettings.siteTitle);
                localStorage.setItem('contact_email', newSettings.contactEmail);
                localStorage.setItem('site_description', newSettings.siteDescription);
                localStorage.setItem('date_format', newSettings.dateFormat);
            }
        } catch (error) {
            console.log('Error loading settings, using defaults');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
        
        // Refresh when user logs in
        const handleStorageChange = () => {
            if (localStorage.getItem('accessToken')) {
                refreshSettings();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also check on mount if user is logged in
        if (localStorage.getItem('accessToken')) {
            refreshSettings();
        }
        
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <SettingsContext.Provider value={{ ...settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
