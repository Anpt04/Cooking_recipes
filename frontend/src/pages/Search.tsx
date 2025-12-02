import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search as SearchIcon,
  Filter,
  Clock,
  Users,
  Star,
  Heart,
} from "lucide-react";
import {
  recipeAPI,
  categoryAPI,
  ingredientAPI,
  favoriteAPI,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import SearchBg from "../img/search_bg.png";
interface Recipe {
  recipe_id: number;
  title: string;
  description: string;
  cooking_time?: number;
  prep_time?: number;
  servings: number;
  difficulty: string;
  image_url?: string;
  categories?: any[];
  ingredient_id: number;
  User?: { username: string };
  ingredients?: {
    ingredient_id: number;
    name: string;
    RecipeIngredient?: { quantity: string };
  }[];
}

interface Ingredient {
  ingredient_id: number;
  name: string;
}

interface Category {
  category_id: number;
  name: string;
}

const BACKGROUND_IMG = SearchBg;

export const Search = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const [searchName, setSearchName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [maxCookingTime, setMaxCookingTime] = useState<number | null>(null);

  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const difficultyLevels = ["easy", "medium", "hard"];

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const filteredIngredientsList = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recipesData, categoriesData, ingredientsData] = await Promise.all(
        [
          recipeAPI.getApproved(),
          categoryAPI.getAll(),
          ingredientAPI.getAll(),
        ]
      );

      const recipesList = Array.isArray(recipesData?.data)
        ? recipesData.data
        : Array.isArray(recipesData)
          ? recipesData
          : [];

      const categoriesList = Array.isArray(categoriesData?.data)
        ? categoriesData.data
        : categoriesData;

      const ingredientsList = Array.isArray(ingredientsData?.data)
        ? ingredientsData.data
        : ingredientsData;

      setRecipes(recipesList);
      setCategories(categoriesList);
      setIngredients(ingredientsList);

      if (user) {
        const favData = await favoriteAPI.getByUser(user.user_id);
        const favSet = new Set<number>(
          (favData.data || []).map((f: any) =>
            Number(f.recipe?.recipe_id ?? f.recipe_id)
          )
        );
        setFavorites(favSet);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (
        searchName &&
        !recipe.title.toLowerCase().includes(searchName.toLowerCase())
      ) {
        return false;
      }

      if (selectedCategories.length > 0) {
        const hasCategory = recipe.categories?.some((cat) =>
          selectedCategories.includes(cat.category_id)
        );
        if (!hasCategory) return false;
      }

      if (selectedIngredients.length > 0) {
        const ingIds = recipe.ingredients?.map((i) => i.ingredient_id);
        const containsAll = selectedIngredients.every((id) =>
          ingIds?.includes(id)
        );
        if (!containsAll) return false;
      }

      if (selectedDifficulty.length > 0) {
        if (!selectedDifficulty.includes(recipe.difficulty)) {
          return false;
        }
      }

      if (maxCookingTime !== null) {
        const totalTime = recipe.cooking_time || 0;
        if (totalTime > maxCookingTime) return false;
      }

      return true;
    });
  }, [
    recipes,
    searchName,
    selectedCategories,
    selectedIngredients,
    selectedDifficulty,
    maxCookingTime,
  ]);

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
      } else {
        await favoriteAPI.add({
          user_id: user.user_id,
          recipe_id: recipeId,
        });
        setFavorites((prev) => new Set(prev).add(recipeId));
      }
    } catch (error) {
      console.error("Lỗi favorite:", error);
    }
  };

  const clearFilters = () => {
    setSearchName("");
    setSelectedCategories([]);
    setSelectedIngredients([]);
    setSelectedDifficulty([]);
    setMaxCookingTime(null);
  };

  const activeFiltersCount = [
    searchName ? 1 : 0,
    selectedCategories.length,
    selectedIngredients.length,
    selectedDifficulty.length,
    maxCookingTime ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${BACKGROUND_IMG})` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <div
              className={`lg:col-span-1 relative ${showFilters ? "block" : "hidden lg:block"}`}
            >

              {/* 🔥 KHUNG BỘ LỌC — nổi trên ảnh nền */}
              <div className="relative z-10 bg-white/85 backdrop-blur-md shadow-lg rounded-xl p-6">

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Xoá tất cả
                    </button>
                  )}
                </div>

                {activeFiltersCount > 0 && (
                  <p className="text-xs text-gray-500 mb-4">
                    {activeFiltersCount} bộ lọc đang áp dụng
                  </p>
                )}

                {/* 🔍 Tìm theo tên */}
                <div className="space-y-6">

                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Tên món ăn
                    </label>
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Nhập tên món..."
                        className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* 🔥 Danh mục */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Danh mục
                    </label>

                    <div className="relative mb-3">
                      <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        placeholder="Tìm danh mục..."
                        className="w-full pl-9 pr-4 py-2 border rounded-lg"
                      />
                    </div>

                    {categorySearchTerm && (
                      <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2 bg-white shadow">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                            <div
                              key={cat.category_id}
                              className="cursor-pointer hover:bg-orange-100 px-2 py-1 rounded"
                              onClick={() => {
                                if (!selectedCategories.includes(cat.category_id)) {
                                  setSelectedCategories([
                                    ...selectedCategories,
                                    cat.category_id,
                                  ]);
                                }
                                setCategorySearchTerm("");
                              }}
                            >
                              {cat.name}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 px-2">Không tìm thấy</p>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedCategories.map((id) => {
                        const cat = categories.find((c) => c.category_id === id);
                        if (!cat) return null;
                        return (
                          <button
                            key={id}
                            onClick={() =>
                              setSelectedCategories(selectedCategories.filter((c) => c !== id))
                            }
                            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all bg-orange-500 text-white shadow-lg`}
                          >
                            {cat.name} ✕
                          </button>
                        );
                      })}
                    </div>
                  )}



                  {/* 🧄 Nguyên liệu */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Nguyên liệu
                    </label>

                    <div className="relative mb-3">
                      <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={ingredientSearchTerm}
                        onChange={(e) => setIngredientSearchTerm(e.target.value)}
                        placeholder="Tìm nguyên liệu..."
                        className="w-full pl-9 pr-4 py-2 border rounded-lg"
                      />
                    </div>

                    {ingredientSearchTerm && (
                      <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2 bg-white shadow">
                        {filteredIngredientsList.length > 0 ? (
                          filteredIngredientsList.map((ing) => (
                            <div
                              key={ing.ingredient_id}
                              className="cursor-pointer hover:bg-orange-100 px-2 py-1 rounded"
                              onClick={() => {
                                if (!selectedIngredients.includes(ing.ingredient_id)) {
                                  setSelectedIngredients([
                                    ...selectedIngredients,
                                    ing.ingredient_id,
                                  ]);
                                }
                                setIngredientSearchTerm("");
                              }}
                            >
                              {ing.name}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 px-2">Không tìm thấy</p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Nguyên liệu đã chọn */}
                  {selectedIngredients.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedIngredients.map((id) => {
                        const ing = ingredients.find((i) => i.ingredient_id === id);
                        if (!ing) return null;
                        return (
                          <span
                            key={id}
                            className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                          >
                            {ing.name}
                            <button
                              className="ml-2 text-green-600 hover:text-green-800"
                              onClick={() =>
                                setSelectedIngredients(
                                  selectedIngredients.filter((i) => i !== id)
                                )
                              }
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}


                  {/* 🎚 Độ khó */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Độ khó
                    </label>
                    <div className="space-y-2">
                      {difficultyLevels.map((level) => (
                        <label
                          key={level}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDifficulty.includes(level)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDifficulty([...selectedDifficulty, level]);
                              } else {
                                setSelectedDifficulty(
                                  selectedDifficulty.filter((d) => d !== level)
                                );
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="capitalize">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ⏱ Thời gian */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Thời gian nấu tối đa
                    </label>

                    <input
                      type="range"
                      min="0"
                      max="240"
                      step="15"
                      value={maxCookingTime ?? 240}
                      onChange={(e) =>
                        setMaxCookingTime(
                          Number(e.target.value) === 240
                            ? null
                            : Number(e.target.value)
                        )
                      }
                      className="w-full"
                    />

                    <p className="text-sm mt-2">
                      {maxCookingTime
                        ? `Tối đa ${maxCookingTime} phút`
                        : "Không giới hạn"}
                    </p>
                  </div>
                </div>

              </div>
            </div>


            {/* 🔥 KẾT QUẢ */}
            <div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <div className="lg:col-span-3">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Kết quả ({filteredRecipes.length})
                </h2>

                {filteredRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRecipes.map((recipe) => (
                      <div
                        key={recipe.recipe_id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl"
                      >
                        <Link to={`/recipes/${recipe.recipe_id}`}>
                          <div className="relative h-48">
                            <img
                              src={recipe.image_url}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>

                        <div className="p-5">
                          <Link to={`/recipes/${recipe.recipe_id}`}>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {recipe.title}
                            </h3>
                          </Link>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {recipe.description}
                          </p>

                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {(recipe.prep_time || 0) +
                                  (recipe.cooking_time || 0)}{" "}
                                phút
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings} người</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {recipe.categories?.slice(0, 2).map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow p-12 text-center">
                    <SearchIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold">Không tìm thấy công thức</h3>
                    <p className="text-gray-600 mb-4">
                      Hãy thử thay đổi bộ lọc hoặc từ khoá tìm kiếm
                    </p>

                    <button
                      onClick={clearFilters}
                      className="px-6 py-2 bg-orange-500 text-white rounded"
                    >
                      Xoá toàn bộ bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
