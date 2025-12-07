import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Users, ChefHat, Star, Heart } from "lucide-react";
import {
  recipeAPI,
  recipeStepAPI,
  favoriteAPI,
  rateAPI,
  rateReportAPI,
} from "../services/api";
import { toastConfirm } from "../components/toastConfirm";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import bg from "../img/home_background.jpeg";

const BACKGROUND = bg;

export const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingRatingId, setEditingRatingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [reportRecipeOpen, setReportRecipeOpen] = useState(false);
  const [reportRatingOpen, setReportRatingOpen] = useState(false);
  const [reportReasonRecipe, setReportReasonRecipe] = useState("");
  const [reportReasonComment, setReportReasonComment] = useState("");
  const [reportRatingId, setReportRatingId] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const fetchData = async () => {
    try {
      const recipeData = await recipeAPI.getById(Number(id));
      setRecipe(recipeData.data || recipeData.recipe);

      const stepData = await recipeStepAPI.getAllByRecipe(Number(id));
      setSteps(stepData.data || []);

      const ratingData = await rateAPI.getByRecipe(Number(id));
      setRatings(ratingData.data || []);

      if (user) {
        const fav = await favoriteAPI.getByUser(user.user_id);

        const favList = fav?.data || fav?.favorites || [];

        setIsFavorite(
          favList.some((f: any) => f.recipe_id === Number(id))
        );

        const myRating = ratingData.rates?.find(
          (r: any) => r.user_id === user.user_id
        );
        if (myRating) {
          setUserRating(myRating.rating);
          setRatingComment(myRating.comment || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

const toggleFavorite = async () => {
  if (!user) return toast.error("Bạn cần đăng nhập để yêu thích!");

  try {
    if (isFavorite) {
      await favoriteAPI.remove(user.user_id, Number(id));
      setIsFavorite(false);

      toast.success("Đã xóa khỏi danh sách yêu thích 💔");

    } else {
      await favoriteAPI.add({
        user_id: user.user_id,
        recipe_id: Number(id),
      });

      setIsFavorite(true);

      toast.success("Đã thêm vào danh sách yêu thích ❤️");
    }
  } catch (e) {
    console.error(e);
    toast.error("Lỗi khi cập nhật yêu thích!");
  }
};


const handleDelete = async () => {
  const confirmed = await toastConfirm("Bạn chắc chắn muốn xóa công thức này?");

  if (!confirmed) return;

  try {
    await recipeAPI.delete(Number(id));
    toast.success("Đã xóa công thức");
    navigate("/");
  } catch {
    toast.error("Không thể xóa");
  }
};

  const submitRecipeReport = async () => {
    if (!reportReasonRecipe.trim()) {
      toast.error("Nhập lý do trước khi gửi");
      return;
    }

    try {
      await recipeAPI.report(Number(id), reportReasonRecipe);
      toast.success("Đã gửi báo cáo");
      setReportRecipeOpen(false);
      setReportReasonRecipe("");
    } catch {
      toast.error("Không thể gửi báo cáo");
    }
  };

  const submitRatingReport = async () => {
    if (!reportReasonComment.trim()) {
      toast.error("Nhập lý do!");
      return;
    }

    try {
      await rateReportAPI.report(reportRatingId!, reportReasonComment);
      toast.success("Đã gửi báo cáo");
      setReportRatingOpen(false);
      setReportReasonComment("");
    } catch {
      toast.error("Không thể gửi báo cáo");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );

  if (!recipe)
    return <div className="text-center mt-20 text-gray-500">Không tìm thấy</div>;

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
      : 0;

  const isOwner = user?.user_id === recipe.user_id;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      <div className="bg-white/70 backdrop-blur-sm min-h-full pb-10">
        {/* HEADER IMAGE */}
        <div className="relative h-56 bg-cover bg-center rounded-b-3xl shadow-lg"
          style={{ backgroundImage: `url(${BACKGROUND})` }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-b-3xl"></div>

          <div className="absolute inset-0 flex flex-col justify-center px-6 max-w-5xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white drop-shadow">
              Chi tiết công thức
            </h1>
            <p className="text-orange-200">Thông tin – nguyên liệu – đánh giá</p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-5xl mx-auto mt-10 p-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

            {/* IMAGE + FAVORITE BUTTON */}
            <div className="relative  bg-gray-200">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat className="h-32 w-32 text-gray-400" />
                </div>
              )}

              {user && (
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 bg-white p-3 rounded-full shadow hover:scale-110 transition"
                >
                  <Heart
                    className={`h-6 w-6 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
                      }`}
                  />
                </button>
              )}
            </div>

            {/* DETAILS */}
            <div className="p-6">
              <div className="flex justify-between">

                <div>
                  <span className="text-orange-600 font-medium uppercase text-sm">
                    {recipe.categories?.map((c: any) => c.name).join(", ") ||
                      "Không phân loại"}
                  </span>

                  <h1 className="text-3xl font-bold mt-1">{recipe.title}</h1>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {recipe.categories?.map((cat: any) => (
                      <span
                        key={cat.category_id}
                        className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-medium text-sm shadow-sm"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-1">
                    Đăng bởi{" "}
                    <Link
                      to={`/profile/${recipe.user_id}`}
                      className="text-orange-600 font-medium"
                    >
                      {recipe.User?.username}
                    </Link>
                  </p>
                </div>


                {/* MENU 3 CHẤM */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === -1 ? null : -1)}
                    className="px-3 py-1 text-xl text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    ⋮
                  </button>

                  {openMenuId === -1 && (
                    <div
                      ref={menuRef}
                      className="absolute right-full mt-2 w-40 bg-white shadow-xl border rounded-xl z-50 animate-fadeIn"
                    >
                      {isOwner ? (
                        <>
                          <button
                            onClick={() => navigate(`/recipes/${id}/edit`)}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            Chỉnh sửa
                          </button>

                          <button
                            onClick={handleDelete}
                            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                          >
                            Xóa
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setReportRecipeOpen(true);
                          }}
                          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                        >
                          Báo cáo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}
              <p className="text-gray-700 mt-4">{recipe.description}</p>

              {/* INFO GRID */}
              <div className="grid grid-cols-3 gap-6 mt-6 border-b pb-6">
                <div className="flex gap-2 items-center">
                  <Clock className="text-orange-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Thời gian</p>
                    <p className="font-semibold">{recipe.cooking_time} phút</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <Users className="text-orange-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Khẩu phần</p>
                    <p className="font-semibold">{recipe.servings} người</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <Star className="text-orange-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Đánh giá</p>
                    <p className="font-semibold">
                      {avgRating.toFixed(1)} ({ratings.length})
                    </p>
                  </div>
                </div>
              </div>

              {/* INGREDIENTS */}
              <h2 className="text-2xl font-bold mt-8 mb-3">Nguyên liệu</h2>

              <div className="grid grid-cols-2 gap-3">
                {recipe.ingredients?.map((ing: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
                  >
                    <span>{ing.name}</span>
                    <span className="text-gray-600">
                      {parseFloat(ing.RecipeIngredient.quantity)} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* STEPS */}
              <h2 className="text-2xl font-bold mt-10 mb-3">Cách làm</h2>

              <div className="space-y-4">
                {steps.map((s, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold">Bước {idx + 1}</h3>
                    <p className="text-gray-700 mt-2">{s.instruction}</p>

                    {s.RecipeImages?.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        {s.RecipeImages.map((img: any, i: number) => (
                          <img
                            key={i}
                            src={img.image_url}
                            className="rounded-lg border h-full w-full object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* RATINGS */}
              <h2 className="text-2xl font-bold mt-10 mb-3">Đánh giá</h2>
              {user && !ratings.some(r => r.user_id === user.user_id) && (
                <div className="bg-white p-4 rounded-xl shadow mb-6">
                  <h3 className="font-semibold text-lg mb-2">Viết đánh giá của bạn</h3>

                  {/* CHỌN SỐ SAO */}
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(num => (
                      <Star
                        key={num}
                        onClick={() => setUserRating(num)}
                        className={`w-7 h-7 cursor-pointer ${num <= userRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>

                  <textarea
                    className="w-full border rounded-xl p-3"
                    rows={3}
                    placeholder="Nhập cảm nhận của bạn..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />

                  <button
                    onClick={async () => {
                      try {
                        if (userRating === 0)
                          return toast.error("Vui lòng chọn số sao trước khi gửi!");

                        await rateAPI.addOrUpdate({
                          user_id: user.user_id,
                          recipe_id: Number(id),
                          rating: userRating,
                          comment: ratingComment,
                        });

                        toast.success("Cảm ơn bạn đã gửi đánh giá! ⭐");

                        fetchData();
                      } catch {
                        toast.error("Không thể gửi đánh giá, vui lòng thử lại!");
                      }
                    }}
                    className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-xl"
                  >
                    Gửi đánh giá
                  </button>

                </div>
              )}

              {/* FORM CHỈNH SỬA ĐÁNH GIÁ CHO USER ĐÃ ĐÁNH GIÁ */}
              {user && ratings.some(r => r.user_id === user.user_id) && editingRatingId === user.user_id && (
                <div className="bg-white p-4 rounded-xl shadow mb-6">
                  <h3 className="font-semibold text-lg mb-2">Chỉnh sửa đánh giá của bạn</h3>

                  {/* CHỌN SỐ SAO */}
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(num => (
                      <Star
                        key={num}
                        onClick={() => setUserRating(num)}
                        className={`w-7 h-7 cursor-pointer ${num <= userRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>

                  <textarea
                    className="w-full border rounded-xl p-3"
                    rows={3}
                    placeholder="Nhập cảm nhận của bạn..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
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

                        toast.success("Bạn đã cập nhật đánh giá thành công! ✨");

                        setEditingRatingId(null);
                        fetchData();
                      } catch {
                        toast.error("Không thể cập nhật đánh giá!");
                      }
                    }}
                    className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-xl"
                  >
                    Lưu thay đổi
                  </button>

                </div>
              )}


              <div className="space-y-4">
                {ratings.length === 0 && (
                  <p className="text-gray-500">Chưa có đánh giá nào.</p>
                )}

                {ratings.map((r: any) => (
                  <div key={r.rate_id} className="bg-gray-50 p-4 rounded-xl relative">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{r.user.username}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(r.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>

                      {/* Rating menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === r.rate_id ? null : r.rate_id
                            )
                          }
                          className="text-xl text-gray-500"
                        >
                          ⋮
                        </button>

                        {openMenuId === r.rate_id && (
                          <div
                            ref={menuRef}
                            className="absolute right-full ml-2 mt-2 w-40 bg-white shadow-xl border rounded-xl z-50"
                          >
                            {r.user_id === user?.user_id ? (
                              <button
                                onClick={() => {
                                  setEditingRatingId(r.user_id);
                                  setUserRating(r.rating);
                                  setRatingComment(r.comment);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              >
                                Chỉnh sửa
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setReportRatingId(r.rate_id);
                                  setReportRatingOpen(true);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                              >
                                Báo cáo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((x) => (
                        <Star
                          key={x}
                          className={`w-5 h-5 ${x <= r.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 mt-2">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>




          </div>
        </div>
      </div>
      {/* ================= REPORT RECIPE MODAL ================= */}
      {reportRecipeOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-3">Báo cáo công thức</h2>

            <textarea
              className="w-full border rounded-xl p-3"
              rows={4}
              placeholder="Nhập lý do..."
              value={reportReasonRecipe}
              onChange={(e) => setReportReasonRecipe(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setReportRecipeOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-xl"
              >
                Hủy
              </button>

              <button
                onClick={submitRecipeReport}
                className="px-4 py-2 bg-red-600 text-white rounded-xl"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= REPORT RATING MODAL ================= */}
      {reportRatingOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-3">Báo cáo đánh giá</h2>

            <textarea
              className="w-full border rounded-xl p-3"
              rows={4}
              placeholder="Nhập lý do..."
              value={reportReasonComment}
              onChange={(e) => setReportReasonComment(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setReportRatingOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-xl"
              >
                Hủy
              </button>

              <button
                onClick={submitRatingReport}
                className="px-4 py-2 bg-red-600 text-white rounded-xl"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
