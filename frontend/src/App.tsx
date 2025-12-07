import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";

import {Navbar} from "./components/Navbar";
import { FollowersList } from "./components/FollowersList";
import { FollowingList } from "./components/FollowingList";
import {Home} from "./pages/Home";
import {Search} from "./pages/Search";
import {RecipeDetail} from "./pages/RecipeDetail";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";
import {RequestIngredientForm} from "./components/RequestIngredientForm";
import  MealPlans from "./pages/MealPlan";
import {Favorites} from "./pages/Favorites";
import {Profile} from "./pages/Profile";
import MealPlanDetail from "./pages/MealPlanDetail";
import {Login} from "./pages/Login";
import {Register} from "./pages/Register";
import UploadProgress from "./pages/UploadProgress";

import {AdminDashboard} from "./pages/admin/Dashboard";
import {AdminCategories} from "./pages/admin/AdminCategories";
import { AdminIngredients } from './pages/admin/AdminIngredients';
import { AdminLayout } from './components/AdminLayout';
import { AdminPendingRecipes } from "./pages/admin/AdminPendingRecipes";
import { AdminRecipeDetail } from "./pages/admin/AdminRecipeDetail";
import { AdminCommentReports } from "./pages/admin/AdminCommentReports";
import {AdminIngredientRequests} from "./pages/admin/AdminIngredientRequests";
import {AdminUserReports} from "./pages/admin/AdminUserReports";
import {AdminRecipeReports} from "./pages/admin/AdminRecipeReports";

function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user.role !== "admin")
    return <Navigate to="/" replace />;

  return <>{children}</>;
}


function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : <>{children}</>;
}

export default function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <>
    <Toaster position="bottom-right" />
    <Router>
      {!isAdmin && <Navbar />}   {/* CHỈ render 1 lần */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />

        {/* PUBLIC */}
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

        {/* USER AUTH */}
        <Route
          path="/recipes/create"
          element={
            <ProtectedRoute>
              <CreateRecipe />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <EditRecipe />
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
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:id/followers" element={<FollowersList />} />
        <Route path="/profile/:id/following" element={<FollowingList />} />
        <Route path="/ingredients/request" element={<RequestIngredientForm />} />
        <Route path="/meal-plans" element={<MealPlans />} />
        <Route path="/meal-plans/:id" element={<MealPlanDetail />} />
        <Route path="/upload-progress" element={<UploadProgress />} />

        {/* ADMIN ROUTES */}
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
        <Route
          path="/admin/pending-recipes"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
                <AdminPendingRecipes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/recipes/:id"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
                <AdminRecipeDetail />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/report-comments"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
                <AdminCommentReports/>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ingredient-requests"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
                <AdminIngredientRequests/>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/admin/report-recipes" 
        element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
              <AdminRecipeReports />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="/admin/report-users" 
        element={
            <ProtectedRoute requireAdmin>
              <AdminLayout>
              <AdminUserReports />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

      </Routes>
    </Router>
    </>
  );
}

