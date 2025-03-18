
import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AuthLayout from './AuthLayout';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <AuthLayout requiredRole="admin">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto pl-64">
          {children}
        </main>
      </div>
    </AuthLayout>
  );
};

export default AdminLayout;
