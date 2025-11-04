import { Link, useLocation } from 'react-router-dom';
import { ChefHat, Home, Heart, Plus, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-900">RecipeShare</span>
          </Link>

          {user && (
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-1 ${
                  isActive('/') ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                } transition-colors`}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              <Link
                to="/favorites"
                className={`flex items-center space-x-1 ${
                  isActive('/favorites') ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                } transition-colors`}
              >
                <Heart className="h-5 w-5" />
                <span>Favorites</span>
              </Link>

              <Link
                to="/recipes/create"
                className={`flex items-center space-x-1 ${
                  isActive('/recipes/create') ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                } transition-colors`}
              >
                <Plus className="h-5 w-5" />
                <span>Add Recipe</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/categories"
                  className={`flex items-center space-x-1 ${
                    location.pathname.startsWith('/admin') ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                  } transition-colors`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Admin</span>
                </Link>
              )}

              <Link
                to="/profile"
                className={`flex items-center space-x-1 ${
                  isActive('/profile') ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                } transition-colors`}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>

              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
