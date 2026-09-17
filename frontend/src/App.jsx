import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import NavBar from './components/common/NavBar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CustomerOrderPage from './pages/CustomerOrderPage.jsx';
import OrderListPage from './pages/OrderListPage.jsx';
import AdminLayout from './pages/AdminLayout.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminBranches from './pages/AdminBranches.jsx';
import AdminSupportTickets from './pages/AdminSupportTickets.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <ProtectedRoute>
                <CustomerOrderPage />
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/orders"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <ProtectedRoute>
                <OrderListPage />
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="branches" element={<AdminBranches />} />
          <Route path="support" element={<AdminSupportTickets />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}