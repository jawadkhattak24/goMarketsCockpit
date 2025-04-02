import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/dashboard/dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './components/auth/login/login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { AuthProvider } from './context/authContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App



