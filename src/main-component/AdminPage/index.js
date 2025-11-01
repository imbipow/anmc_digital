import React, { Fragment, useEffect } from 'react';
import AdminPanel from '../../components/AdminPanel';
import { AuthProvider, ProtectedAdminRoute } from '../../components/AdminAuth';

const AdminContent = () => {
    useEffect(() => {
        document.title = 'Admin Panel - ANMC';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <Fragment>
            <AdminPanel />
        </Fragment>
    );
};

const AdminPage = () => {
    return (
        <AuthProvider>
            <ProtectedAdminRoute>
                <AdminContent />
            </ProtectedAdminRoute>
        </AuthProvider>
    );
};

export default AdminPage;