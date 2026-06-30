import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ChatProvider } from './contexts/ChatContext';
import { PublicRoute } from './guards/PublicRoute';
import { ProtectedRoute } from './guards/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import MasterPanel from './pages/master';
import CompanyPanel from './pages/company';
import SellerPanel from './pages/seller';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ChatProvider>
            <Routes>
              {/* Public route: Login */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />

              {/* Protected: Master Panel (master_root + master_staff) */}
              <Route
                path="/master/*"
                element={
                  <ProtectedRoute allowedRoles={['master_root', 'master_staff']}>
                    <MasterPanel />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Company Panel (company_admin only) */}
              <Route
                path="/company/*"
                element={
                  <ProtectedRoute allowedRoles={['company_admin']}>
                    <CompanyPanel />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Seller Panel (seller only) */}
              <Route
                path="/seller/*"
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <SellerPanel />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all: redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ChatProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
