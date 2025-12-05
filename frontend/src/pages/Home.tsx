import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star, Heart } from "lucide-react";
import { recipeAPI, favoriteAPI, categoryAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import homeBg from "../img/home_background.jpeg";
import toast from "react-hot-toast";
import homeBg_fot from "../img/1_bg_head.png";

interface Recipe {
  recipe_id: number;
  title: string;
  description: string;
  cooking_time: number;
  servings: number;
  difficulty_level: string;
  image_url: string;
  category_id: number;
  user_id: number;
  created_at: string;
  User?: { username: string };
  categories?: { name: string; category_id: number }[];
}

export const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [latestRecipes, setLatestRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (p = 1) => {
    try {
      const [recipesRes, categoriesData] = await Promise.all([
        recipeAPI.getApproved(p),
        categoryAPI.getAll(),
      ]);

      const recipeList = recipesRes.data || [];
      setRecipes(recipeList);
      setPage(recipesRes.page);
      setTotalPages(recipesRes.totalPages);

      if (p === 1) {
        const sortedLatest = [...recipeList]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 10);

        setLatestRecipes(sortedLatest);
      }

      const categoriesList = categoriesData.data || categoriesData;
      setCategories(categoriesList);

      if (user) {
        const favData = await favoriteAPI.getByUser(user.user_id);
        const favSet = new Set<number>(
          favData.data?.map((f: any) => f.recipe_id ?? f.recipe?.recipe_id) ||
            []
        );
        setFavorites(favSet);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipeId: number) => {
    if (!user) return;
    try {
      if (favorites.has(recipeId)) {
        await favoriteAPI.remove(user.user_id, recipeId);
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
        toast.success("Đã xóa khỏi danh sách yêu thích 💔");
      } else {
        await favoriteAPI.add({ user_id: user.user_id, recipe_id: recipeId });
        setFavorites((prev) => new Set(prev).add(recipeId));
        toast.success("Đã thêm vào danh sách yêu thích ❤️");
      }
    } catch (error) {
      console.error("Lỗi khi thêm/xoá yêu thích:", error);
    }
  };

  const filteredRecipes = selectedCategory
    ? recipes.filter((r) =>
        r.categories?.some((c) => c.category_id === selectedCategory)
      )
    : recipes;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div
        className="relative w-full h-[380px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url(${homeBg})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-white">
          <h1 className="text-5xl font-extrabold drop-shadow-lg">
            Khám phá những công thức tuyệt vời
          </h1>
          <p className="text-xl mt-2 opacity-90">
            Chia sẻ món ăn của bạn với mọi người
          </p>
        </div>
      </div>

      {/* SLIDER */}
      <div className="max-w-8xl mx-auto px-4 -mt-20 relative z-20">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <div className="relative w-full overflow-hidden">
            <div className="flex animate-infinite-loop">
              {[...latestRecipes, ...latestRecipes].map((recipe, index) => (
                <Link
                  key={index}
                  to={`/recipes/${recipe.recipe_id}`}
                  className="w-64 flex-none block"
                >
                  <div className="relative h-56">
                    <img
                      src={recipe.image_url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 w-full bg-black/50 text-white p-3 text-sm">
                      {recipe.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .animate-infinite-loop {
            display: flex;
            animation: infiniteLoop 40s linear infinite;
            width: max-content;
          }

          .animate-infinite-loop:hover {
            animation-play-state: paused;
          }

          @keyframes infiniteLoop {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

      {/* CATEGORY FILTER */}
      <div className="max-w-7xl mx-auto px-4 pt-16">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-orange-50"
            }`}
          >
            Tất cả công thức
          </button>

          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => {
                setSelectedCategory(cat.category_id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.category_id
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-orange-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* RECIPE LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.recipe_id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 bg-gradient-to-br from-orange-200 to-amber-200">
                <Link
                  to={`/recipes/${recipe.recipe_id}`}
                  className="absolute inset-0"
                >
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Star className="h-16 w-16 text-orange-400 absolute inset-0 m-auto" />
                  )}
                </Link>

                {/* Nút yêu thích */}
                <button
                  onClick={() => toggleFavorite(recipe.recipe_id)}
                  className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:scale-110 transition-transform shadow-sm"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.has(recipe.recipe_id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>

              <div className="p-5">
                <Link to={`/recipes/${recipe.recipe_id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-500 transition-colors">
                    {recipe.title}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {recipe.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.cooking_time} phút</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} khẩu phần</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {(recipe.categories?.length ?? 0) > 0 ? (
                    (recipe.categories ?? []).map((c, i) => (
                      <div
                        key={i}
                        className="bg-orange-100 text-orange-500 text-xs font-semibold uppercase px-3 py-1 rounded-full"
                      >
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      Không có danh mục
                    </span>
                  )}
                </div>

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

        {selectedCategory === null && (
          <div className="flex justify-center mt-10 gap-3">
            {/* TRANG TRƯỚC */}
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Trang trước
            </button>

            <span className="px-4 py-2 font-semibold">
              {page} / {totalPages}
            </span>

            {/* TRANG TIẾP */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Trang tiếp
            </button>
          </div>
        )}

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Không tìm thấy công thức nào trong danh mục này.
            </p>
          </div>
        )}
      </div>
      <div
        className="mt-20 w-full h-[380px] bg-cover bg-center rounded-t-2xl shadow-lg"
        style={{
          backgroundImage: `url(${homeBg_fot})`,
          backgroundPosition: "center 100%",
        }}
      ></div>
    </div>
  );
};
