import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, Clock, Users, Star, Heart, X } from 'lucide-react';
import { recipeAPI, categoryAPI, ingredientAPI, favoriteAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Recipe {
  recipe_id: number;
  title: string;
  description: string;
  cooking_time?: number;
  prep_time?: number;
  servings: number;
  difficulty_level: string;
  image_url?: string;
  categories?: any[];
  User?: { username: string };
}

interface Ingredient {
  ingredient_id: number;
  name: string;
}

interface Category {
  category_id: number;
  name: string;
}

export const Search = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Search filters
  const [searchName, setSearchName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [maxCookingTime, setMaxCookingTime] = useState<number | null>(null);

  // Search terms for dropdowns
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const difficultyLevels = ['easy', 'medium', 'hard'];

  // Filter categories and ingredients based on search terms
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const filteredIngredientsList = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recipesData, categoriesData, ingredientsData] = await Promise.all([
        recipeAPI.getAll(),
        categoryAPI.getAll(),
        ingredientAPI.getAll(),
      ]);

      const recipesList = Array.isArray(recipesData?.data)
        ? recipesData.data
        : Array.isArray(recipesData)
        ? recipesData
        : [];

      const categoriesList = Array.isArray(categoriesData?.data)
        ? categoriesData.data
        : Array.isArray(categoriesData)
        ? categoriesData
        : [];

      const ingredientsList = Array.isArray(ingredientsData?.data)
        ? ingredientsData.data
        : Array.isArray(ingredientsData)
        ? ingredientsData
        : [];

      setRecipes(recipesList);
      setCategories(categoriesList);
      setIngredients(ingredientsList);

      if (user) {
        const favData = await favoriteAPI.getByUser(user.user_id);
        const favSet = new Set<number>(
            (favData.favorites || []).map((f: any) => Number(f.recipe_id))
        );
        setFavorites(favSet);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Tìm kiếm theo tên
      if (searchName && !recipe.title.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      // Lọc theo danh mục
      if (selectedCategories.length > 0) {
        const hasCategory = recipe.categories?.some(cat =>
          selectedCategories.includes(cat.category_id)
        );
        if (!hasCategory) return false;
      }

      // Lọc theo nguyên liệu
      if (selectedIngredients.length > 0) {
        // Note: This requires checking if recipe has the ingredients
        // For now, we'll skip this check as it depends on your data structure
        // You may need to fetch recipe ingredients separately
      }

      // Lọc theo độ khó
      if (selectedDifficulty.length > 0) {
        if (!selectedDifficulty.includes(recipe.difficulty_level)) {
          return false;
        }
      }

      // Lọc theo thời gian nấu
      if (maxCookingTime !== null) {
        const totalTime = (recipe.prep_time || 0) + (recipe.cooking_time || 0);
        if (totalTime > maxCookingTime) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, searchName, selectedCategories, selectedIngredients, selectedDifficulty, maxCookingTime]);

  const toggleFavorite = async (recipeId: number) => {
    if (!user) return;

    try {
      if (favorites.has(recipeId)) {
        await favoriteAPI.remove(user.user_id, recipeId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
      } else {
        await favoriteAPI.add({ user_id: user.user_id, recipe_id: recipeId });
        setFavorites(prev => new Set(prev).add(recipeId));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const clearFilters = () => {
    setSearchName('');
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
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Search Recipes</h1>
          <p className="text-lg text-orange-100">Find your perfect recipe with advanced filters</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <p className="text-xs text-gray-500 mb-4">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                </p>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Recipe Name
                  </label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="Search recipe..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Categories
                  </label>
                  <div className="relative mb-3">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(cat => (
                        <label key={cat.category_id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.category_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, cat.category_id]);
                              } else {
                                setSelectedCategories(
                                  selectedCategories.filter(id => id !== cat.category_id)
                                );
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-gray-700 text-sm">{cat.name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No categories found</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Ingredients
                  </label>
                  <div className="relative mb-3">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={ingredientSearchTerm}
                      onChange={(e) => setIngredientSearchTerm(e.target.value)}
                      placeholder="Search ingredients..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredIngredientsList.length > 0 ? (
                      filteredIngredientsList.map(ing => (
                        <label key={ing.ingredient_id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(ing.ingredient_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIngredients([...selectedIngredients, ing.ingredient_id]);
                              } else {
                                setSelectedIngredients(
                                  selectedIngredients.filter(id => id !== ing.ingredient_id)
                                );
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-gray-700 text-sm">{ing.name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No ingredients found</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Difficulty Level
                  </label>
                  <div className="space-y-2">
                    {difficultyLevels.map(level => (
                      <label key={level} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDifficulty.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDifficulty([...selectedDifficulty, level]);
                            } else {
                              setSelectedDifficulty(
                                selectedDifficulty.filter(d => d !== level)
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700 capitalize text-sm">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Max Cooking Time
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="240"
                      step="15"
                      value={maxCookingTime ?? 240}
                      onChange={(e) => setMaxCookingTime(Number(e.target.value) === 240 ? null : Number(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {maxCookingTime ? `Up to ${maxCookingTime} min` : 'No limit'}
                      </span>
                      {maxCookingTime && (
                        <button
                          onClick={() => setMaxCookingTime(null)}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-bold text-gray-900">
                Results ({filteredRecipes.length})
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            <div className="hidden lg:block mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Results ({filteredRecipes.length})
              </h2>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRecipes.map(recipe => (
                  <div
                    key={recipe.recipe_id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <Link to={`/recipes/${recipe.recipe_id}`}>
                      <div className="h-48 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center relative">
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Star className="h-16 w-16 text-orange-400" />
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(recipe.recipe_id);
                          }}
                          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:scale-110 transition-transform"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              favorites.has(recipe.recipe_id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                    </Link>

                    <div className="p-5">
                      <Link to={`/recipes/${recipe.recipe_id}`}>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-orange-500 transition-colors">
                          {recipe.title}
                        </h3>
                      </Link>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{(recipe.prep_time || 0) + (recipe.cooking_time || 0)} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full capitalize">
                            {recipe.difficulty_level}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          by {recipe.User?.username || 'Unknown'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {recipe.categories && recipe.categories.length > 0 ? (
                          recipe.categories.slice(0, 2).map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No category</span>
                        )}
                        {recipe.categories && recipe.categories.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{recipe.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
