import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Users, ChefHat, X, Check } from "lucide-react";

import { adminRecipeAPI, recipeAPI, recipeStepAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export const AdminRecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  // ❗ Không phải admin th về home
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const recipeData = await recipeAPI.getById(Number(id));
      setRecipe(recipeData.data || recipeData);

      const stepData = await recipeStepAPI.getAllByRecipe(Number(id));
      setSteps(stepData.data || []);
    } catch (error) {
      console.error("Error loading recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    try {
      await adminRecipeAPI.approve(Number(id));
      alert("✔ Công thức đã được duyệt!");
      navigate("/admin/pending-recipes");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi duyệt công thức!");
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      await adminRecipeAPI.reject(Number(id), rejectReason);
      alert("❌ Đã từ chối công thức");
      navigate("/admin/pending-recipes");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi từ chối!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Không tìm thấy công thức.
      </div>
    );
  }

  const categoryNames = recipe.categories?.map((c: any) => c.name).join(", ") || "Uncategorized";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow overflow-hidden">

        {/* IMAGE */}
        <div className="h-96 bg-gray-100 relative flex items-center justify-center">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              className="w-full h-full object-cover"
              alt={recipe.title}
            />
          ) : (
            <ChefHat className="h-32 w-32 text-orange-400" />
          )}
        </div>

        {/* INFO */}
        <div className="p-8">

          <p className="text-xs text-orange-600 uppercase font-semibold">{categoryNames}</p>
          <h1 className="text-4xl font-bold mt-1 mb-2">{recipe.title}</h1>

          <p className="text-gray-600 text-lg mb-6">{recipe.description}</p>

          {/* TIME / SERVINGS */}
          <div className="flex space-x-8 border-b pb-6 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Thời gian nấu</p>
                <p className="font-semibold">{recipe.cooking_time} phút</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Khẩu phần</p>
                <p className="font-semibold">{recipe.servings}</p>
              </div>
            </div>
          </div>

          {/* INGREDIENTS */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-3">Nguyên liệu</h2>

            {recipe.ingredients?.length ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recipe.ingredients.map((ing: any, i: number) => (
                  <li
                    key={i}
                    className="flex justify-between bg-gray-50 px-3 py-2 rounded-md border text-sm"
                  >
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-gray-600">{ing.RecipeIngredient?.quantity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Không có nguyên liệu</p>
            )}
          </div>

          {/* STEPS */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Các bước</h2>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.step_id} className="bg-gray-50 p-4 rounded-lg border shadow-sm">

                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold">Bước {index + 1}</h3>
                  </div>

                  <p className="text-gray-700 mb-3">{step.instruction}</p>

                  {step.RecipeImages?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                      {step.RecipeImages.map((img: any, i: number) => (
                        <img
                          key={i}
                          src={img.image_url}
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* APPROVE / REJECT */}
          <div className="border-t pt-6 mt-10">
            <h2 className="text-2xl font-bold mb-4">Duyệt công thức</h2>

            <div className="flex space-x-3">
              <button
                onClick={approve}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <Check className="w-5 h-5" /> Duyệt
              </button>

              <button
                onClick={() => setShowRejectBox(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <X className="w-5 h-5" /> Từ chối
              </button>
            </div>

            {showRejectBox && (
              <div className="mt-6 bg-red-50 border border-red-300 p-4 rounded-lg">
                <textarea
                  rows={4}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full border rounded-lg p-3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex justify-end mt-3 space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                    onClick={() => {
                      setShowRejectBox(false);
                      setRejectReason("");
                    }}
                  >
                    Hủy
                  </button>

                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    onClick={reject}
                  >
                    Gửi lý do từ chối
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
