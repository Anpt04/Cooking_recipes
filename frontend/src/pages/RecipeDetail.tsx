import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, data } from 'react-router-dom';
import { Clock, Users, ChefHat, Star, Heart, Trash2, Edit } from 'lucide-react';
import { recipeAPI, recipeStepAPI, favoriteAPI, rateAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingRatingId, setEditingRatingId] = useState<number | null>(null); 

  useEffect(() => {
    fetchRecipeData();
  }, [id]);

  const fetchRecipeData = async () => {
    try {
      const recipeData = await recipeAPI.getById(Number(id));
      setRecipe(recipeData.data || recipeData.recipe || recipeData);

      const stepsData = await recipeStepAPI.getAllByRecipe(Number(id));
      setSteps(stepsData.data || []);

      const ratingsData = await rateAPI.getByRecipe(Number(id));
      setRatings(ratingsData.data || []);
      console.log('Ratings from API:', ratingsData.data);

      if (user) {
        const favData = await favoriteAPI.getByUser(user.user_id);
        const isFav = favData.favorites?.some((f: any) => f.recipe_id === Number(id));
        setIsFavorite(isFav);

        const existingRating = ratingsData.rates?.find((r: any) => r.user_id === user.user_id);
        if (existingRating) {
          setUserRating(existingRating.rating);
          setRatingComment(existingRating.comment || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return;

    try {
      if (isFavorite) {
        await favoriteAPI.remove(user.user_id, Number(id));
        setIsFavorite(false);
      } else {
        await favoriteAPI.add({ user_id: user.user_id, recipe_id: Number(id) });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // const handleRating = async (rating: number) => {
  //   if (!user) return;

  //   try {
  //     await rateAPI.addOrUpdate({
  //       user_id: user.user_id,
  //       recipe_id: Number(id),
  //       rating,
  //       comment: ratingComment,
  //     });
  //     setUserRating(rating);
  //     fetchRecipeData();
  //   } catch (error) {
  //     console.error('Failed to submit rating:', error);
  //   }
  // };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await recipeAPI.delete(Number(id));
      navigate('/');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Recipe not found</p>
      </div>
    );
  }

  const averageRating = ratings.length > 0
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
    : 0;

  const isOwner = user?.user_id === recipe.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-96 bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center relative">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ChefHat className="h-32 w-32 text-orange-400" />
            )}
            {user && (
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Heart
                  className={`h-6 w-6 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`}
                />
              </button>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-orange-500 uppercase">
                  {recipe.categories && recipe.categories.length > 0
                    ? recipe.categories.map((c: { name: string }) => c.name).join(', ')
                    : 'Uncategorized'}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                <p className="text-gray-600 flex items-center space-x-2">
                  <span>By</span>
                  <Link
                    to={`/profile/${recipe.user_id}`}
                    className="font-medium text-orange-500 hover:text-orange-600"
                  >
                    {recipe.User?.username || 'Unknown'}
                  </Link>
                </p>
              </div>
              {isOwner && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/recipes/${id}/edit`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-700 text-lg mb-6">{recipe.description}</p>

            <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Time</p>
                  <p className="font-semibold">{recipe.cooking_time} min</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Servings</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-semibold">{averageRating.toFixed(1)} ({ratings.length})</p>
                </div>
              </div>
            </div>
            {/* Ingredients Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>

              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ing: any, i: number) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md border border-gray-200 text-sm"
                    >
                      <span className="font-medium text-gray-800 truncate max-w-[70%]">
                        {ing.name}
                      </span>
                      <span className="text-gray-600 text-xs whitespace-nowrap">
                        {ing.RecipeIngredient?.quantity || '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No ingredients listed.</p>
              )}
            </div>



            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={step.step_id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Bước {index + 1}</h3>
                    </div>

                    <p className="text-gray-700 mb-3">{step.instruction}</p>

                    {step.RecipeImages && step.RecipeImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                        {step.RecipeImages.map((img: any, i: number) => (
                          <img
                            key={i}
                            src={img.image_url}
                            alt={`Step ${index + 1} image ${i + 1}`}
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {user && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Đánh giá công thức</h3>

                {/* Hiển thị danh sách comment */}
                <div className="space-y-4">
                  {ratings.length > 0 ? (
                    ratings.map((rating) => {
                      const isOwnerComment = rating.user_id === user?.user_id;
                      const isEditing = editingRatingId === rating.user_id;

                      return (
                        <div
                          key={`${rating.user_id}-${rating.recipe_id}`}
                          className="bg-gray-50 p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            {/* Tên và sao theo cột */}
                            <div className="flex flex-col">
                              <p className="font-medium text-gray-900">{rating.user.username}</p>
                              <div className="flex mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Dấu 3 chấm dọc để chỉnh sửa */}
                            {isOwnerComment && !isEditing && (
                              <button
                                onClick={() => {
                                  setEditingRatingId(rating.user_id);
                                  setUserRating(rating.rating);
                                  setRatingComment(rating.comment || '');
                                }}
                                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
                              >
                                ⋮
                              </button>
                            )}
                          </div>
                          {/* Comment */}
                          <p className="text-gray-700">{rating.comment}</p>

                          {/* Nếu đang chỉnh sửa */}
                          {isEditing && (
                            <div className="mt-4">
                              <div className="flex space-x-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    className="hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`h-8 w-8 ${
                                        star <= userRating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>

                              <textarea
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
                                rows={3}
                              />

                              <button
                                onClick={async () => {
                                  try {
                                    await rateAPI.addOrUpdate({
                                      user_id: user.user_id,
                                      recipe_id: Number(id),
                                      rating: userRating,
                                      comment: ratingComment,
                                    });
                                    alert('Đã cập nhật đánh giá!');
                                    setEditingRatingId(null);
                                    setRatingComment('');
                                    setUserRating(0);
                                    fetchRecipeData(); // Cập nhật lại danh sách đánh giá
                                  } catch (error) {
                                    console.error('Failed to update rating:', error);
                                    alert('Không thể lưu đánh giá!');
                                  }
                                }}
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                              >
                                💾 Lưu chỉnh sửa
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có đánh giá nào</p>
                  )}
                </div>

                {/* Thêm đánh giá mới nếu chưa có */}
                {!ratings.some((r) => r.user_id === user?.user_id) && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Đánh giá của bạn</h4>

                    <div className="flex space-x-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Nhập nhận xét của bạn (tùy chọn)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
                      rows={3}
                    />

                    {(userRating > 0 || ratingComment.trim() !== '') && (
                      <button
                        onClick={async () => {
                          try {
                            await rateAPI.addOrUpdate({
                              user_id: user.user_id,
                              recipe_id: Number(id),
                              rating: userRating,
                              comment: ratingComment,
                            });
                            alert('Đã lưu đánh giá!');
                            setUserRating(0);
                            setRatingComment('');
                            fetchRecipeData();
                          } catch (error) {
                            console.error('Failed to submit rating:', error);
                            alert('Không thể lưu đánh giá!');
                          }
                        }}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                      >
                        💾 Lưu đánh giá
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
};
