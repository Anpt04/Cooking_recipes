import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Save } from "lucide-react";
import {
  recipeAPI,
  recipeStepAPI,
  categoryAPI,
  ingredientAPI,
  recipeIngredientAPI,
  recipeCategoryAPI,
  recipeImageAPI,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Category {
  category_id: number;
  name: string;
}

interface Ingredient {
  ingredient_id: number;
  name: string;
}

interface SelectedIngredient {
  ingredient_id: number;
  quantity: string;
}

interface FormData {
  title: string;
  description: string;
  cooking_time: number;
  servings: number;
  difficulty_level: string;
  image_url: string;
}

interface Step {
  instruction: string;
  image: File | null;
}

export const RecipeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const ingredientRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    cooking_time: 0,
    servings: 1,
    difficulty_level: "easy",
    image_url: "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [steps, setSteps] = useState<Step[]>([{ instruction: "", image: null }]);

  useEffect(() => {
    fetchCategories();
    fetchIngredients();
    if (isEdit) fetchRecipe();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (ingredientRef.current && !ingredientRef.current.contains(event.target as Node)) {
        setShowIngredientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await ingredientAPI.getAll();
      setIngredients(res.data || []);
    } catch {
      setIngredients([]);
    }
  };

  const fetchRecipe = async () => {
    try {
      const recipeData = await recipeAPI.getById(Number(id));
      const recipe = recipeData.data;
      setFormData({
        title: recipe.title,
        description: recipe.description,
        cooking_time: recipe.cooking_time || 0,
        servings: recipe.servings || 1,
        difficulty_level: recipe.difficulty_level || "easy",
        image_url: recipe.image_url || "",
      });

      const stepsData = await recipeStepAPI.getAllByRecipe(Number(id));
      setSteps(
        (stepsData.steps || []).map((s: any) => ({
          instruction: s.instruction,
          image: null,
        }))
      );

      const ingredientsData = await recipeIngredientAPI.getByRecipe(Number(id));
      setSelectedIngredients(
        ingredientsData.data?.map((item: any) => ({
          ingredient_id: item.ingredient_id,
          quantity: item.quantity || "",
        })) || []
      );
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setMainImage(e.target.files[0]);
  };

  const handleQuantityChange = (id: number, value: string) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === id ? { ...ing, quantity: value } : ing
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // === 1️⃣ GIAI ĐOẠN 1: TẠO HOẶC CẬP NHẬT RECIPE ===
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("cooking_time", String(formData.cooking_time));
      data.append("servings", String(formData.servings));
      data.append("difficulty_level", formData.difficulty_level);
      data.append("user_id", String(user.user_id));
      if (mainImage) data.append("image", mainImage);

      let recipeId: number;
      if (isEdit) {
        await recipeAPI.update(Number(id), data);
        recipeId = Number(id);
      } else {
        const res = await recipeAPI.create(data);
        recipeId = res.data.recipe_id;
      }

      if (!recipeId) throw new Error("Không thể tạo recipe.");

      console.log("✅ Recipe created/verified:", recipeId);

      // === 2️⃣ GIAI ĐOẠN 2: THÊM DANH MỤC & NGUYÊN LIỆU ===
      await Promise.all([
        ...selectedCategories.map((cat) =>
          recipeCategoryAPI.add({
            recipe_id: recipeId,
            category_id: cat.category_id,
          })
        ),
        ...selectedIngredients.map((ing) =>
          recipeIngredientAPI.add({
            recipe_id: recipeId,
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity || "",
          })
        ),
      ]);

      // === 3️⃣ GIAI ĐOẠN 3: THÊM CÁC BƯỚC NẤU ===
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.instruction.trim()) {
          const stepData = {
            recipe_id: recipeId,
            step_number: i + 1,
            instruction: step.instruction,
          };

          const createdStep = await recipeStepAPI.create(stepData);

    // 2️⃣ Nếu có ảnh cho bước này → gửi API /recipe_images
        if (step.image) {
          const imageForm = new FormData();
          imageForm.append("recipe_id", String(recipeId));
          imageForm.append("step_id", String(createdStep.data.step_id)); // ✅ nếu cần
          imageForm.append("image", step.image as File);

          await recipeImageAPI.add(imageForm);
          }
        }
      }

      alert("✅ Lưu công thức thành công!");
      navigate(`/recipes/${recipeId}`);
    } catch (error) {
      console.error("❌ Failed to save recipe:", error);
      alert("Lưu công thức thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">
          {isEdit ? "Chỉnh sửa công thức" : "Tạo công thức mới"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 font-medium">Tên món ăn</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Cooking Time */}
            <div>
              <label className="block mb-2 font-medium">Thời gian nấu (phút)</label>
              <input
                type="number"
                min="0"
                value={formData.cooking_time}
                onChange={(e) =>
                  setFormData({ ...formData, cooking_time: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-4 py-3"
                placeholder="VD: 30"
              />
            </div>

            {/* Servings */}
            <div>
              <label className="block mb-2 font-medium">Số người ăn</label>
              <input
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) =>
                  setFormData({ ...formData, servings: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-4 py-3"
                placeholder="VD: 4"
              />
            </div>
          </div>


          {/* Category (multi-select) */}
          <div ref={categoryRef}>
            <label className="block mb-2 font-medium">Danh mục</label>
            <input
              type="text"
              placeholder="Tìm danh mục..."
              value={categorySearch}
              onFocus={() => setShowCategoryDropdown(true)}
              onChange={(e) => setCategorySearch(e.target.value.toLowerCase())}
              className="w-full border rounded-lg px-4 py-3"
            />
            {showCategoryDropdown && (
              <div className="absolute w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow">
                {categories
                  .filter((cat) =>
                    cat.name.toLowerCase().includes(categorySearch)
                  )
                  .map((cat) => (
                    <div
                      key={cat.category_id}
                      onClick={() => {
                        if (
                          !selectedCategories.find(
                            (c) => c.category_id === cat.category_id
                          )
                        ) {
                          setSelectedCategories([
                            ...selectedCategories,
                            cat,
                          ]);
                        }
                        setShowCategoryDropdown(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-orange-100"
                    >
                      {cat.name}
                    </div>
                  ))}
              </div>
            )}

            {/* Selected categories */}
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedCategories.map((cat) => (
                <div
                  key={cat.category_id}
                  className="flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full"
                >
                  <span>{cat.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        prev.filter((c) => c.category_id !== cat.category_id)
                      )
                    }
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients (multi-select + quantity) */}
          <div ref={ingredientRef}>
            <label className="block mb-2 font-medium">Nguyên liệu</label>
            <input
              type="text"
              placeholder="Tìm nguyên liệu..."
              value={ingredientSearch}
              onFocus={() => setShowIngredientDropdown(true)}
              onChange={(e) => setIngredientSearch(e.target.value.toLowerCase())}
              className="w-full border rounded-lg px-4 py-3"
            />
            {showIngredientDropdown && (
              <div className="absolute w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow">
                {ingredients
                  .filter((ing) =>
                    ing.name.toLowerCase().includes(ingredientSearch)
                  )
                  .map((ing) => (
                    <div
                      key={ing.ingredient_id}
                      onClick={() => {
                        if (
                          !selectedIngredients.find(
                            (s) => s.ingredient_id === ing.ingredient_id
                          )
                        ) {
                          setSelectedIngredients([
                            ...selectedIngredients,
                            { ingredient_id: ing.ingredient_id, quantity: "" },
                          ]);
                        }
                        setShowIngredientDropdown(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-orange-100"
                    >
                      {ing.name}
                    </div>
                  ))}
              </div>
            )}

            <div className="space-y-2 mt-3">
              {selectedIngredients.map((sel) => {
                const ing = ingredients.find(
                  (i) => i.ingredient_id === sel.ingredient_id
                );
                return (
                  <div
                    key={sel.ingredient_id}
                    className="flex items-center justify-between border rounded-lg px-3 py-2 bg-orange-50 border-orange-300"
                  >
                    <span>{ing?.name}</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Số lượng / khối lượng"
                        value={sel.quantity}
                        onChange={(e) =>
                          handleQuantityChange(sel.ingredient_id, e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm w-36"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIngredients((prev) =>
                            prev.filter(
                              (i) => i.ingredient_id !== sel.ingredient_id
                            )
                          )
                        }
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 font-medium">Ảnh món ăn</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {mainImage && (
              <img
                src={URL.createObjectURL(mainImage)}
                alt="Preview"
                className="mt-3 h-40 rounded-lg object-cover"
              />
            )}
          </div>

          {/* Steps */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium">Các bước nấu</h2>
              <button
                type="button"
                onClick={() =>
                  setSteps([...steps, { instruction: "", image: null }])
                }
                className="text-orange-500 hover:text-orange-600 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm bước</span>
              </button>
            </div>

            {steps.map((step, i) => (
              <div key={i} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">Bước {i + 1}</h3>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSteps(steps.filter((_, idx) => idx !== i))
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <textarea
                  value={step.instruction}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[i].instruction = e.target.value;
                    setSteps(newSteps);
                  }}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  placeholder="Mô tả bước"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const newSteps = [...steps];
                      newSteps[i].image = e.target.files[0];
                      setSteps(newSteps);
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
