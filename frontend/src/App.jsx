import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import AuthParams from './pages/Auth';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateEvidence from './pages/CreateEvidence';
import TransferCustody from './pages/TransferCustody';
import VerifyIntegrity from './pages/VerifyIntegrity';
import LedgerBlocks from './pages/LedgerBlocks';
import EvidenceAudit from './pages/EvidenceAudit';
import BlockchainVisualization from './pages/BlockchainVisualization';
import EvidenceVault from './pages/EvidenceVault';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading Auth...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <AuthParams type="login" /> },
  { path: '/register', element: <AuthParams type="register" /> },
  {
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/profile', element: <Profile /> },
      { path: '/evidence/create', element: <CreateEvidence /> },
      { path: '/evidence/transfer', element: <TransferCustody /> },
      { path: '/evidence/verify', element: <VerifyIntegrity /> },
      { path: '/evidence/:id/audit', element: <EvidenceAudit /> },
      { path: '/evidence/:id/vault', element: <EvidenceVault /> },
      { path: '/ledger/blocks', element: <LedgerBlocks /> },
      { path: '/ledger/visualizer', element: <BlockchainVisualization /> },
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
