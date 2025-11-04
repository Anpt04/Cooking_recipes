import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Edit2, Save, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { userAPI, recipeAPI } from "../services/api";

export const Profile = () => {
  const { user, setUser } = useAuth(); // ✅ lấy setUser từ context
  const [isEditing, setIsEditing] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    avatar_url: "",
    avatarFile: null as File | null, // ✅ thêm file avatar
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        avatar_url: user.avatar_url || "",
        avatarFile: null,
      });
      setPreview(user.avatar_url || null);
      fetchUserRecipes();
    }
  }, [user]);

  const fetchUserRecipes = async () => {
    try {
      const recipesData = await recipeAPI.getAll();
      const allRecipes = Array.isArray(recipesData?.data)
        ? recipesData.data
        : Array.isArray(recipesData)
        ? recipesData
        : [];
      const userRecipes = allRecipes.filter(
        (r: any) => r.user_id === user?.user_id
      );
      setRecipes(userRecipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    }
  };

  // ✅ Xử lý chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatarFile: file }));
      setPreview(URL.createObjectURL(file)); // hiển thị ảnh xem trước
    }
  };

  // ✅ Cập nhật profile mà không reload
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("username", formData.username);
      if (formData.avatarFile) {
        form.append("avatar", formData.avatarFile); // gửi file avatar
      }

      // gọi API cập nhật (dạng multipart/form-data)
      const updated = await userAPI.updateProfile(form);

      // ✅ Cập nhật user trong context
      setUser((prev) => ({
        ...prev,
        ...updated.user, // giả sử API trả về user mới trong updated.user
      }));

      setIsEditing(false);
      alert("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Cập nhật hồ sơ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-48"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-orange-100 flex items-center justify-center">
                  <User className="h-16 w-16 text-orange-500" />
                </div>
              )}

              {/* ✅ Nút chọn ảnh (chỉ hiện khi đang chỉnh sửa) */}
              {isEditing && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1 rounded-b-full cursor-pointer">
                  <label className="text-sm font-medium cursor-pointer">
                    Chọn ảnh
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? "Saving..." : "Save"}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {user.username || user.username}
                      </h1>
                      <p className="text-gray-600 mt-1">@{user.username}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-5 w-5" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                

                  <div className="mt-6 flex space-x-6">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {recipes.length}
                      </p>
                      <p className="text-gray-600">Recipes</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Công thức của user */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.recipe_id}
                to={`/recipes/${recipe.recipe_id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-orange-400" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {recipes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500 mb-4">
                You haven't created any recipes yet.
              </p>
              <Link
                to="/recipes/create"
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Create Your First Recipe
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
