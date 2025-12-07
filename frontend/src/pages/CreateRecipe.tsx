import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

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

import hbg from "../img/fav_head.jpg";
import bg from "../img/home_background.jpeg";

const BACKGROUND = bg;
const H_BG = hbg;

interface Category {
  category_id: number;
  name: string;
}

interface Ingredient {
  ingredient_id: number;
  name: string;
  unit: string;
}

interface SelectedIngredient {
  ingredient_id: number;
  quantity: string;
}

interface FormDataType {
  title: string;
  description: string;
  cooking_time: number;
  servings: number;
  difficulty: string;
}

interface Step {
  instruction: string;
  images: File[];
}

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);

  const [categorySearch, setCategorySearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const ingredientRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    cooking_time: 0,
    servings: 1,
    difficulty: "easy",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [steps, setSteps] = useState<Step[]>([{ instruction: "", images: [] }]);

  // LOAD CATEGORY + INGREDIENTS
  useEffect(() => {
    fetchCategories();
    fetchIngredients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        ingredientRef.current &&
        !ingredientRef.current.contains(event.target as Node)
      ) {
        setShowIngredientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data ?? []);
    } catch {
      setCategories([]);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await ingredientAPI.getAll();
      setIngredients(res.data ?? []);
    } catch {
      setIngredients([]);
    }
  };

  // HANDLE IMAGE
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleQuantityChange = (id: number, value: string) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === id ? { ...ing, quantity: value } : ing
      )
    );
  };

  // 🎯🎯🎯 UPLOAD NGẦM — gửi state sang trang process
  const updateProgressPage = (
    message: string,
    progress: number,
    recipeId?: number
  ) => {
    navigate("/upload-progress", {
      state: {
        message,
        progress,
        recipeId,
      },
    });
  };

  // SUBMIT FORM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    if (selectedIngredients.some(ing => !ing.quantity || ing.quantity.trim() === "")) {
      toast.error("Vui lòng nhập đầy đủ số lượng cho tất cả nguyên liệu!");
      setLoading(false);
      return;
    }


    try {
      updateProgressPage("Đang tạo công thức...", 5);

      // Tạo form data
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("cooking_time", String(formData.cooking_time));
      data.append("servings", String(formData.servings));
      data.append("difficulty", formData.difficulty);
      data.append("user_id", String(user.user_id));

      if (mainImage) data.append("image", mainImage);

      // 1️⃣ Tạo Recipe
      const res = await recipeAPI.create(data);
      const recipeId = res.data.recipe_id;
      if (!recipeId) throw new Error("Không thể tạo recipe.");

      updateProgressPage("Đang thêm danh mục...", 20);

      // 2️⃣ Thêm Category
      await Promise.all(
        selectedCategories.map((cat) =>
          recipeCategoryAPI.add({
            recipe_id: recipeId,
            category_id: cat.category_id,
          })
        )
      );

      updateProgressPage("Đang thêm nguyên liệu...", 40);

      // 3️⃣ Thêm Ingredient
      await Promise.all(
        selectedIngredients.map((ing) =>
          recipeIngredientAPI.add({
            recipe_id: recipeId,
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity || "",
          })
        )
      );

      // 4️⃣ Upload Step + Images
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        if (step.instruction.trim()) {
          const createdStep = await recipeStepAPI.create({
            recipe_id: recipeId,
            step_number: i + 1,
            instruction: step.instruction,
          });

          // Upload từng ảnh + update % progress nhỏ
          for (let j = 0; j < step.images.length; j++) {
            const fd = new FormData();
            fd.append("recipe_id", String(recipeId));
            fd.append("step_id", String(createdStep.data.step_id));
            fd.append("image", step.images[j]);

            await recipeImageAPI.add(fd);

            const subProgress = 40 + ((i * 100) / steps.length) * 0.4;
            updateProgressPage(
              "Đang tải ảnh bước...",
              Math.min(90, subProgress)
            );
          }
        }
      }

      updateProgressPage("Hoàn tất!", 100, recipeId);

      setTimeout(() => {
        navigate(`/recipes/${recipeId}`);
      }, 1000);
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Tạo công thức thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">
        {/* HEADER */}
        <div
          className="relative h-56 bg-cover bg-center shadow-lg rounded-b-3xl"
          style={{ backgroundImage: `url(${H_BG})` }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-b-3xl"></div>

          <div className="absolute inset-0 flex flex-col justify-center px-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
              Tạo công thức mới
            </h1>
            <p className="text-orange-100 text-lg mt-1 drop-shadow">
              Điền thông tin và chia sẻ món ăn tuyệt vời của bạn
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-10 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TÊN MÓN */}
            <div>
              <label className="block mb-2 font-semibold">Tên món ăn</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* MÔ TẢ */}
            <div>
              <label className="block mb-2 font-semibold">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* THÔNG TIN CHUNG */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 font-semibold">
                  Thời gian nấu (phút)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.cooking_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cooking_time: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Khẩu phần</label>
                <input
                  type="number"
                  min={1}
                  value={formData.servings}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      servings: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Độ khó</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-3 bg-white"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
            </div>

            {/* DANH MỤC */}
            <div ref={categoryRef} className="relative">
              <label className="block mb-2 font-semibold">Danh mục</label>
              <input
                type="text"
                placeholder="Tìm danh mục..."
                value={categorySearch}
                onFocus={() => setShowCategoryDropdown(true)}
                onChange={(e) =>
                  setCategorySearch(e.target.value.toLowerCase())
                }
                className="w-full border rounded-lg px-4 py-3"
              />

              {showCategoryDropdown && (
                <div className="absolute bg-white border rounded-lg w-full mt-1 max-h-48 overflow-y-auto shadow z-50">
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
                            setSelectedCategories([...selectedCategories, cat]);
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

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat.category_id}
                    className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center"
                  >
                    {cat.name}
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
                  </span>
                ))}
              </div>
            </div>

            {/* NGUYÊN LIỆU */}
            <div ref={ingredientRef} className="relative">
              <label className="block mb-2 font-semibold">Nguyên liệu</label>
              <input
                type="text"
                placeholder="Tìm nguyên liệu..."
                value={ingredientSearch}
                onFocus={() => setShowIngredientDropdown(true)}
                onChange={(e) =>
                  setIngredientSearch(e.target.value.toLowerCase())
                }
                className="w-full border rounded-lg px-4 py-3"
              />

              {showIngredientDropdown && (
                <div className="absolute bg-white border rounded-lg w-full mt-1 max-h-48 overflow-y-auto shadow">
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
                              {
                                ingredient_id: ing.ingredient_id,
                                quantity: "",
                              },
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
                      className="border rounded-lg px-3 py-2 bg-orange-50 flex items-center justify-between"
                    >
                      <span>{ing?.name}</span>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Số lượng"
                          value={sel.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              sel.ingredient_id,
                              e.target.value
                            )
                          }
                          className="border rounded px-2 py-1 text-sm w-28"
                        />
                        <span className="text-gray-700 text-sm w-10">
                          {ing?.unit || ""}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedIngredients((prev) =>
                              prev.filter(
                                (i) => i.ingredient_id !== sel.ingredient_id
                              )
                            )
                          }
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ẢNH CHÍNH */}
            <div>
              <label className="block mb-2 font-semibold">Ảnh món ăn</label>

              <label className="w-full cursor-pointer bg-orange-50 border border-orange-300 text-orange-600 px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-100 transition">
                <ImageIcon className="h-5 w-5" />
                Chọn ảnh
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>

              {mainImage && (
                <img
                  src={URL.createObjectURL(mainImage)}
                  className="mt-3 h-48 rounded-lg object-cover shadow"
                />
              )}
            </div>

            {/* CÁC BƯỚC */}
            <div>
              <h2 className="font-semibold text-lg mb-3">Các bước nấu</h2>

              {steps.map((step, i) => (
                <div
                  key={i}
                  className="border rounded-xl p-4 mb-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">Bước {i + 1}</h3>

                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSteps(steps.filter((_, idx) => idx !== i))
                        }
                        className="text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={step.instruction}
                    onChange={(e) => {
                      const arr = [...steps];
                      arr[i].instruction = e.target.value;
                      setSteps(arr);
                    }}
                    className="w-full border rounded-lg px-3 py-2 mb-3"
                  />

                  {/* UPLOAD ẢNH */}
                  <label className="cursor-pointer bg-orange-50 border border-orange-300 text-orange-600 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-100 w-max">
                    <ImageIcon className="h-5 w-5" />
                    Thêm ảnh
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (!e.target.files) return;
                        const files = Array.from(e.target.files);

                        const arr = [...steps];
                        arr[i].images = [...arr[i].images, ...files];
                        setSteps(arr);
                      }}
                    />
                  </label>

                  {/* PREVIEW ẢNH */}
                  {step.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {step.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            className="h-full w-full object-cover rounded-lg border"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...steps];
                              arr[i].images = arr[i].images.filter(
                                (_, x) => x !== idx
                              );
                              setSteps(arr);
                            }}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setSteps([...steps, { instruction: "", images: [] }])
                }
                className="flex items-center text-orange-600 hover:text-orange-700"
              >
                <Plus className="h-4 w-4" />
                <span className="ml-1">Thêm bước</span>
              </button>
            </div>

            {/* NÚT SUBMIT */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg flex items-center hover:bg-orange-600 transition"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? "Đang xử lý..." : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
