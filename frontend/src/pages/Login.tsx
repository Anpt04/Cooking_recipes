import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal ban
  const [banMessage, setBanMessage] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      await new Promise((res) => setTimeout(res, 120));

      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      const msg = err.message || 'Login failed';

      // Bị ban
      if (
        msg.includes('khóa') ||
        msg.includes('bị ban') ||
        msg.includes('banned')
      ) {
        setBanMessage(msg);
        setShowBanModal(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4 relative">
      
      {/* ---------------------- BAN MODAL ---------------------- */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              
              <div className="bg-red-100 p-4 rounded-full shadow-inner">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Tài khoản bị khóa
              </h2>

              <p className="text-gray-600 leading-relaxed">
                {banMessage}
              </p>

              <button
                onClick={() => setShowBanModal(false)}
                className="mt-2 px-5 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ------------------- END BAN MODAL -------------------- */}

      {/* LOGIN FORM */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 p-3 rounded-full">
            <ChefHat className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Chào mừng
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to continue to RecipeShare
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Đăng ký
          </Link>
        </p>
      </div>

      {/* Animation CSS */}
      <style>
        {`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}
      </style>
    </div>
  );
};
