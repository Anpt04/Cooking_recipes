import { Link, useLocation, useNavigate} from "react-router-dom";
import {
  ChefHat,
  Home,
  Search,
  User,
  LogOut,
  Heart,
  Plus,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpenMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {user?.role !== "admin" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* LOGO */}
            <Link to="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">RecipeShare</span>
            </Link>

            <div className="flex items-center space-x-6">

              {/* HOME */}
              <Link
                to="/"
                className={`flex items-center space-x-1 ${
                  isActive("/") ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              {/* SEARCH */}
              <Link
                to="/search"
                className={`flex items-center space-x-1 ${
                  isActive("/search")
                    ? "text-orange-500"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </Link>

              {/* ACCOUNT MENU */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(!openMenu)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-orange-500"
                  >
                    <User className="h-5 w-5" />
                    <span>{user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {openMenu && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-48 z-50"
                    >
                      <Link
                        to="/favorites"
                        className="flex items-center px-4 py-2 hover:bg-gray-100"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Link>

                      <Link
                        to="/recipes/create"
                        className="flex items-center px-4 py-2 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Recipe
                      </Link>

                      <Link
                        to="/ingredients/request"
                        className="flex items-center px-4 py-2 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Request Ingredient
                      </Link>

                      
                      <Link
                        to="/meal-plans"
                        className="flex items-center px-4 py-2 hover:bg-gray-100"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Meal Plans
                      </Link>

                      <Link
                        to={`/profile/${user.user_id}`}
                        className="flex items-center px-4 py-2 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>

                      <button
                        onClick={() => {
                          logout(); 
                          navigate("/");          
                        }}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* NOT LOGGED IN */}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 text-gray-600 hover:text-orange-500"
                  >
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </Link>

                  <Link
                    to="/register"
                    className="flex items-center space-x-1 text-gray-600 hover:text-orange-500"
                  >
                    <User className="h-5 w-5" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
