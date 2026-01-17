import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';
import UnitsList from './pages/Units/List';
import UnitDetails from './pages/Units/Details';
import UnitForm from './pages/Units/Form';
import UsersList from './pages/Users/List';
import UserForm from './pages/Users/Form';
import PaymentsList from './pages/Payments/List';
import PaymentDetails from './pages/Payments/Details';
import PaymentForm from './pages/Payments/Form';
import CostCentersList from './pages/CostCenters/List';
import CostCenterForm from './pages/CostCenters/Form';
import LogsList from './pages/Logs/List';
import LogDetails from './pages/Logs/Details';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PostsList from './pages/Posts/List';
import PostForm from './pages/Posts/Form';
import PostDetails from './pages/Posts/Details';
import { Loader2 } from 'lucide-react';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />

        {/* Units Routes */}
        <Route path="units" element={<UnitsList />} />
        <Route path="units/new" element={<UnitForm />} />
        <Route path="units/:id" element={<UnitDetails />} />
        <Route path="units/:id/edit" element={<UnitForm />} />

        {/* Users Routes */}
        <Route path="users" element={<UsersList />} />
        <Route path="users/new" element={<UserForm />} />
        <Route path="users/:id/edit" element={<UserForm />} />

        {/* Payments Routes */}
        <Route path="payments" element={<PaymentsList />} />
        <Route path="payments/new" element={<PaymentForm />} />
        <Route path="payments/:id" element={<PaymentDetails />} />
        <Route path="payments/:id/edit" element={<PaymentForm />} />

        {/* Cost Centers Routes */}
        <Route path="cost-centers" element={<CostCentersList />} />
        <Route path="cost-centers/new" element={<CostCenterForm />} />
        <Route path="cost-centers/:id/edit" element={<CostCenterForm />} />

        {/* Activity Logs Routes */}
        <Route path="logs" element={<LogsList />} />
        <Route path="logs/:id" element={<LogDetails />} />

        {/* Posts Routes */}
        <Route path="posts" element={<PostsList />} />
        <Route path="posts/new" element={<PostForm />} />
        <Route path="posts/:id" element={<PostDetails />} />
        <Route path="posts/:id/edit" element={<PostForm />} />
      </Route>
    </Routes>
  );
}
