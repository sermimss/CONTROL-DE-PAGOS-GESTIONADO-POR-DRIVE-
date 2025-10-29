import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Student } from '../types';
import { Payment } from '../types';
import driveService, { GoogleDriveUser } from '../services/googleDrive';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export const useGoogleDrive = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState<GoogleDriveUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

    const debounceTimer = useRef<number | null>(null);
    const isDataLoaded = useRef(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await driveService.loadData();
            setStudents(data.students || []);
            setPayments(data.payments || []);
            setSyncStatus('synced');
            isDataLoaded.current = true;
        } catch (error) {
            console.error('Error loading data from Google Drive:', error);
            alert('No se pudieron cargar los datos desde Google Drive.');
            setSyncStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveData = useCallback(async (currentStudents: Student[], currentPayments: Payment[]) => {
        setSyncStatus('syncing');
        try {
            await driveService.saveData({ students: currentStudents, payments: currentPayments });
            setSyncStatus('synced');
        } catch (error) {
            console.error('Error saving data to Google Drive:', error);
            setSyncStatus('error');
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await driveService.initClient((tokenResponse) => {
                const signedInUser = driveService.getSignedInUser();
                setUser(signedInUser);
                setIsSignedIn(!!signedInUser);
                if (signedInUser && !isDataLoaded.current) {
                   loadData();
                } else {
                    setIsLoading(false); // If not signed in, stop loading
                }
            });
             // Initial check
            const signedInUser = driveService.getSignedInUser();
            setIsSignedIn(!!signedInUser);
            setUser(signedInUser);

            if (signedInUser) {
                await loadData();
            } else {
                setIsLoading(false);
            }
            setIsInitialized(true);
        };
        init();
    }, [loadData]);
    
    // Debounced save effect
    useEffect(() => {
        if (!isDataLoaded.current || !isSignedIn) {
            return;
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        setSyncStatus('syncing');
        debounceTimer.current = window.setTimeout(() => {
            saveData(students, payments);
        }, 2000); // 2-second debounce time
    
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [students, payments, isSignedIn, saveData]);

    const handleSignIn = async () => {
        await driveService.signIn();
        // The callback in initClient will handle the state update
    };

    const handleSignOut = async () => {
        await driveService.signOut();
        setIsSignedIn(false);
        setUser(null);
        setStudents([]);
        setPayments([]);
        setSyncStatus('idle');
        isDataLoaded.current = false;
    };

    return { 
        students, 
        setStudents, 
        payments, 
        setPayments, 
        isInitialized,
        isSignedIn, 
        user, 
        handleSignIn, 
        handleSignOut,
        isLoading,
        syncStatus
    };
};