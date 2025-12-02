import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Clock, Users, Trash2 } from "lucide-react";
import { favoriteAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import headBg from "../img/fav_head.jpg"
import bg from "../img/home_background.jpeg"

const BG_IMG = bg;
const HEADER_IMG = headBg ;

export const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  if (!user) return;

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getByUser(user.user_id);

      const favoriteList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setFavorites(favoriteList);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách yêu thích:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId: number) => {
    try {
      await favoriteAPI.remove(user.user_id, recipeId);
      setFavorites((prev) => prev.filter((r) => r.recipe_id !== recipeId));
    } catch (error) {
      console.error("❌ Lỗi khi xoá yêu thích:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BG_IMG})` }}
    >
      {/* Lớp mờ */}
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">
        {/* Header */}
        <div
          className="relative py-16 bg-cover bg-center text-white"
          style={{
            backgroundImage: `url(${HEADER_IMG})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Heart className="h-12 w-12" />
              <div>
                <h1 className="text-5xl font-extrabold mb-2">
                  Công thức yêu thích
                </h1>
                <p className="text-lg text-gray-200">
                  Những món ăn bạn đã lưu lại
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites
                .filter((r) => r && r.recipe_id)
                .map((recipe) => (
                  <div
                    key={recipe.recipe_id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all"
                  >
                    <Link to={`/recipes/${recipe.recipe_id}`}>
                      <div className="relative h-48 bg-gradient-to-br from-orange-200 to-amber-200">
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Heart className="h-16 w-16 text-orange-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      {/* Danh mục + Xoá */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-orange-500 uppercase">
                          {recipe.categories && recipe.categories.length > 0
                            ? recipe.categories
                                .map((c: { name: string }) => c.name)
                                .join(", ")
                            : "Không có danh mục"}
                        </span>

                        <button
                          onClick={() => removeFavorite(recipe.recipe_id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition"
                          title="Xoá khỏi yêu thích"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Tên công thức */}
                      <Link to={`/recipes/${recipe.recipe_id}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-500">
                          {recipe.title}
                        </h3>
                      </Link>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {recipe.description}
                      </p>

                      {/* Thông tin */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.cooking_time} phút</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{recipe.servings || 1} khẩu phần</span>
                        </div>
                      </div>

                      {/* Tác giả */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          Bởi{" "}
                          <span className="font-medium">
                            {recipe.User?.username || "Ẩn danh"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Chưa có công thức yêu thích
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy thêm một số công thức để xem chúng ở đây.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition"
              >
                Khám phá công thức
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
