'use client';

import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '../../config/authConfig';

interface Props {
    children: React.ReactNode;
}


msalInstance.initialize();
export default function AuthProvider({ children }: Props) {
    return (
        <MsalProvider instance={msalInstance}>
            {children}
        </MsalProvider>
    )
}