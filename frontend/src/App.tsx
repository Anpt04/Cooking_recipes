import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { RecipeDetail } from './pages/RecipeDetail';
import { RecipeForm } from './pages/RecipeForm';
import { Profile } from './pages/Profile';
import { Favorites } from './pages/Favorites';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminIngredients } from './pages/admin/AdminIngredients';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthenticatedApp />
      </BrowserRouter>
    </AuthProvider>
  );
}
function AuthenticatedApp() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {!isAdmin && user && <Navbar />}

      <Routes>
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* User routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              <RecipeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/create"
          element={
            <ProtectedRoute>
              <RecipeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <RecipeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ingredients"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
                <AdminIngredients />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}


export default App;
