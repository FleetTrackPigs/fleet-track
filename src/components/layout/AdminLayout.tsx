import { ReactNode, useState, useEffect } from 'react'
import AdminSidebar from './AdminSidebar'
import AuthLayout from './AuthLayout'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen and set up resize listener
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    // Initial check
    checkIfMobile()

    // Listen for window resize
    window.addEventListener('resize', checkIfMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar')
      const toggleButton = document.getElementById('sidebar-toggle')

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node)
      ) {
        setSidebarOpen(false)
      }
    }

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen, isMobile])

  return (
    <AuthLayout requiredRole="admin">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile sidebar toggle button */}
        <Button
          id="sidebar-toggle"
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>

        {/* Sidebar - visible on desktop, toggleable on mobile */}
        <div
          id="admin-sidebar"
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static h-full z-40`}
        >
          <AdminSidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto transition-all duration-300 p-4 lg:p-6 w-full lg:ml-64">
          {children}
        </main>
      </div>
    </AuthLayout>
  )
}

export default AdminLayout
