import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { FleetProvider } from '@/contexts/FleetContext'

// Pages
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import DriverDashboard from './pages/driver/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import DriversPage from './pages/admin/Drivers'
import VehiclesPage from './pages/admin/Vehicles'
import AssignPage from './pages/admin/Assign'
import MapPage from './pages/admin/Map'
import VehicleDetailPage from './pages/admin/VehicleDetail'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <FleetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />

              {/* Driver Routes */}
              <Route path="/driver/dashboard" element={<DriverDashboard />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/drivers" element={<DriversPage />} />
              <Route path="/admin/vehicles" element={<VehiclesPage />} />
              <Route
                path="/admin/vehicles/:id"
                element={<VehicleDetailPage />}
              />
              <Route path="/admin/assign" element={<AssignPage />} />
              <Route path="/admin/map" element={<MapPage />} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FleetProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
