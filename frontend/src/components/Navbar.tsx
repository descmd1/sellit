'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, Menu, X, LogOut, User, Package, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin, isSeller } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Sell<span className="text-primary-600">It</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">Browse</Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Link>
                )}
                {isSeller && (
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                    <Package className="w-4 h-4" /> My Listings
                  </Link>
                )}
                {!isAdmin && (
                  <Link href="/history" className="text-gray-600 hover:text-gray-900 font-medium">Purchases</Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l">
                  <span className="text-sm text-gray-500">
                    <User className="w-4 h-4 inline mr-1" />{user.name}
                  </span>
                  <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-secondary text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Register</Link>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          <Link href="/" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Browse</Link>
          {user ? (
            <>
              {isAdmin && <Link href="/admin" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>}
              {isSeller && <Link href="/dashboard" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>My Listings</Link>}
              {!isAdmin && <Link href="/history" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Purchases</Link>}
              <button onClick={handleLogout} className="block py-2 text-red-600 w-full text-left">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
