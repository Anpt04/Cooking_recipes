import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Heart } from 'lucide-react';
import { recipeAPI, favoriteAPI, categoryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  categories?: { name: string, category_id: number }[];
}

export const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recipesData, categoriesData] = await Promise.all([
        recipeAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      console.log(recipesData);
      setRecipes(
        Array.isArray(recipesData?.data)
          ? recipesData.data
          : Array.isArray(recipesData)
            ? recipesData
            : []
      );
      setCategories(
        Array.isArray(categoriesData?.data)
          ? categoriesData.data
          : Array.isArray(categoriesData)
            ? categoriesData
            : []
      );

      if (user) {
        const favData = await favoriteAPI.getByUser(user.user_id);
        const favSet = new Set<number>(favData.favorites?.map((f: any) => f.recipe_id) || []);
        setFavorites(favSet);

      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredRecipes = selectedCategory
  ? recipes.filter(r =>
      r.categories?.some(c => c.category_id === selectedCategory)
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
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Discover Amazing Recipes</h1>
          <p className="text-xl text-orange-100">Share your culinary creations with the world</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-orange-50'
            }`}
          >
            All Recipes
          </button>
          {categories.map(cat => (
            <button
              key={cat.category_id}
              onClick={() => setSelectedCategory(cat.category_id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.category_id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.recipe_id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                <Link to={`/recipes/${recipe.recipe_id}`} className="absolute inset-0">
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

                {/* ❤️ Nút tim nằm góc phải */}
                <button
                  onClick={() => toggleFavorite(recipe.recipe_id)}
                  className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:scale-110 transition-transform shadow-sm"
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

              <div className="p-5">
                <Link to={`/recipes/${recipe.recipe_id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-500 transition-colors">
                    {recipe.title}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.cooking_time} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {recipe.categories && recipe.categories.length > 0 ? (
                    recipe.categories.map((c, i) => (
                      <div
                        key={i}
                        className="bg-orange-100 text-orange-500 text-xs font-semibold uppercase px-3 py-1 rounded-full"
                      >
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      Uncategorized
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    By <span className="font-medium">{recipe.User?.username || 'Unknown'}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No recipes found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
