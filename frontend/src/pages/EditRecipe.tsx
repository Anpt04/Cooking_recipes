import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

import bg from "../img/home_background.jpeg";
import hbg from "../img/fav_head.jpg";

const BACKGROUND = bg;
const H_BG = hbg;

interface Category {
  category_id: number;
  name: string;
}

interface Ingredient {
  ingredient_id: number;
  name: string;
  unit?: string;
}

interface SelectedIngredient {
  ingredient_id: number;
  quantity: string;
}

interface ExistingImage {
  image_id: number;
  image_url: string;
  public_id?: string;
}

interface Step {
  step_id?: number;
  instruction: string;
  existingImages: ExistingImage[];
  imagesToDelete: number[];
  newImages: File[];
}

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const recipeId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [initialCategories, setInitialCategories] = useState<Category[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [initialIngredients, setInitialIngredients] = useState<SelectedIngredient[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const ingredientRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cooking_time: 0,
    servings: 1,
    difficulty: "easy",
    image_url: "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  const [steps, setSteps] = useState<Step[]>([
    { instruction: "", existingImages: [], imagesToDelete: [], newImages: [] },
  ]);

  const [deletedStepIds, setDeletedStepIds] = useState<number[]>([]);

  // ===== FETCH DATA =====
  useEffect(() => {
    if (!recipeId) return;
    fetchCategories();
    fetchIngredients();
    fetchRecipe();
  }, [recipeId]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node))
        setShowCategoryDropdown(false);
      if (ingredientRef.current && !ingredientRef.current.contains(e.target as Node))
        setShowIngredientDropdown(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
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
      setPageLoading(true);

      const recipeData = await recipeAPI.getById(recipeId);
      const recipe = recipeData.data || recipeData;

      setFormData({
        title: recipe.title,
        description: recipe.description,
        cooking_time: recipe.cooking_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        image_url: recipe.image_url,
      });

      setMainImagePreview(recipe.image_url);

      const catRaw = recipe.categories || [];
      const catList = catRaw.map((c: any) => ({
        category_id: c.category_id,
        name: c.name,
      }));

      setSelectedCategories(catList);
      setInitialCategories(catList);

      const ingRes = await recipeIngredientAPI.getByRecipe(recipeId);
      const ingList =
        ingRes.data?.map((i: any) => ({
          ingredient_id: i.ingredient_id,
          quantity: i.quantity || "",
        })) || [];

      setSelectedIngredients(ingList);
      setInitialIngredients(ingList);

      const stepRes = await recipeStepAPI.getAllByRecipe(recipeId);
      const sArr: Step[] =
        stepRes.data?.map((s: any) => ({
          step_id: s.step_id,
          instruction: s.instruction,
          existingImages:
            s.RecipeImages?.map((img: any) => ({
              image_id: img.image_id,
              image_url: img.image_url,
              public_id: img.public_id,
            })) || [],
          imagesToDelete: [],
          newImages: [],
        })) || [];

      setSteps(
        sArr.length
          ? sArr
          : [{ instruction: "", existingImages: [], imagesToDelete: [], newImages: [] }]
      );
    } catch (err) {
      console.error(err);
      toast.error("Không tải được dữ liệu công thức.");
    } finally {
      setPageLoading(false);
    }
  };

  // ===== MAIN IMAGE =====
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setMainImage(e.target.files[0]);
      setMainImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // ===== INGREDIENT QUANTITY =====
  const handleQuantityChange = (id: number, value: string) => {
    setSelectedIngredients((prev) =>
      prev.map((i) => (i.ingredient_id === id ? { ...i, quantity: value } : i))
    );
  };

  // ===== SYNC CATEGORIES  =====
  const syncCategories = async (recipeId: number) => {
    const oldSet = new Set(initialCategories.map((c) => c.category_id));
    const newSet = new Set(selectedCategories.map((c) => c.category_id));

    const add = selectedCategories.filter((c) => !oldSet.has(c.category_id));
    const remove = initialCategories.filter((c) => !newSet.has(c.category_id));

    await Promise.all([
      ...add.map((c) => recipeCategoryAPI.add({ recipe_id: recipeId, category_id: c.category_id })),
      ...remove.map((c) =>
        recipeCategoryAPI.delete({ recipe_id: recipeId, category_id: c.category_id })
      ),
    ]);

    setInitialCategories(selectedCategories);
  };

  // ===== SYNC INGREDIENTS =====
  const syncIngredients = async (recipeId: number) => {
    const oldMap = new Map(initialIngredients.map((i) => [i.ingredient_id, i.quantity]));
    const newMap = new Map(selectedIngredients.map((i) => [i.ingredient_id, i.quantity]));

    const add: any[] = [];
    const update: any[] = [];
    const remove: any[] = [];

    for (const [id, qty] of newMap.entries()) {
      if (!oldMap.has(id)) add.push(recipeIngredientAPI.add({ recipe_id: recipeId, ingredient_id: id, quantity: qty }));
      else if (oldMap.get(id) !== qty)
        update.push(recipeIngredientAPI.update(recipeId, id, { quantity: qty }));
    }

    for (const [id] of oldMap.entries()) {
      if (!newMap.has(id)) remove.push(recipeIngredientAPI.delete(recipeId, id));
    }

    await Promise.all([...add, ...update, ...remove]);
    setInitialIngredients(selectedIngredients);
  };

  // ===== UPDATE STEPS + IMAGES =====
  const upsertStepsWithImages = async (recipeId: number) => {
    for (let index = 0; index < steps.length; index++) {
      const step = steps[index];
      const step_number = index + 1;

      // Step cũ → update
      if (step.step_id) {
        const fd = new FormData();
        fd.append("step_number", String(step_number));
        fd.append("instruction", step.instruction);
        fd.append("recipe_id", String(recipeId));

        await recipeStepAPI.update(step.step_id, fd);

        if (step.imagesToDelete.length)
          await Promise.all(step.imagesToDelete.map((id) => recipeImageAPI.delete(id)));

        if (step.newImages.length) {
          for (const img of step.newImages) {
            const fd2 = new FormData();
            fd2.append("recipe_id", String(recipeId));
            fd2.append("step_id", String(step.step_id));
            fd2.append("image", img);
            await recipeImageAPI.add(fd2);
          }
        }
      } else {
        // Step mới → create
        if (!step.instruction.trim() && !step.newImages.length) continue;

        const created = await recipeStepAPI.create({
          recipe_id: recipeId,
          step_number,
          instruction: step.instruction,
        });

        const newId = created.data?.step_id;
        if (!newId) continue;

        for (const img of step.newImages) {
          const fd2 = new FormData();
          fd2.append("recipe_id", String(recipeId));
          fd2.append("step_id", String(newId));
          fd2.append("image", img);
          await recipeImageAPI.add(fd2);
        }
      }
    }
  };

  // ===== SUBMIT FORM =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("cooking_time", String(formData.cooking_time));
      fd.append("servings", String(formData.servings));
      fd.append("difficulty", formData.difficulty);
      fd.append("user_id", String(user.user_id));
      if (mainImage) fd.append("image", mainImage);

      await recipeAPI.update(recipeId, fd);

      await syncCategories(recipeId);
      await syncIngredients(recipeId);

      if (deletedStepIds.length)
        await Promise.all(deletedStepIds.map((sid) => recipeStepAPI.delete(sid)));

      await upsertStepsWithImages(recipeId);

      toast.success("Cập nhật công thức thành công!");
      navigate(`/recipes/${recipeId}`);
    } catch (e) {
      toast.error("Không thể cập nhật công thức!");
    } finally {
      setLoading(false);
    }
  };

  // ===== PAGE LOADING =====
  if (pageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-b-2 border-orange-500 rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">
        {/* HEADER ẢNH */}
        <div
          className="relative h-56 bg-cover bg-center shadow-lg rounded-b-3xl"
          style={{ backgroundImage: `url(${H_BG})` }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-b-3xl"></div>

          <div className="absolute inset-0 flex flex-col justify-center px-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
              Chỉnh sửa công thức
            </h1>
            <p className="text-orange-100 text-lg mt-1 drop-shadow">
              Cập nhật thông tin món ăn của bạn
            </p>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-10 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TÊN MÓN ĂN */}
            <div>
              <label className="font-semibold block mb-2">Tên món ăn</label>
              <input
                value={formData.title}
                required
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* MÔ TẢ */}
            <div>
              <label className="font-semibold block mb-2">Mô tả</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* GRID 3 CỘT */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="font-semibold block mb-2">Thời gian (phút)</label>
                <input
                  type="number"
                  value={formData.cooking_time}
                  onChange={(e) =>
                    setFormData({ ...formData, cooking_time: Number(e.target.value) })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">Khẩu phần</label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) =>
                    setFormData({ ...formData, servings: Number(e.target.value) })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">Độ khó</label>
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
              <label className="font-semibold block mb-2">Danh mục</label>
              <input
                type="text"
                placeholder="Tìm danh mục..."
                value={categorySearch}
                onFocus={() => setShowCategoryDropdown(true)}
                onChange={(e) => setCategorySearch(e.target.value.toLowerCase())}
                className="w-full border rounded-lg px-4 py-3"
              />

              {showCategoryDropdown && (
                <div className="absolute bg-white shadow border w-full rounded-lg mt-1 max-h-48 overflow-y-auto z-20">
                  {categories
                    .filter((c) => c.name.toLowerCase().includes(categorySearch))
                    .map((cat) => (
                      <div
                        key={cat.category_id}
                        onClick={() => {
                          if (!selectedCategories.find((c) => c.category_id === cat.category_id))
                            setSelectedCategories([...selectedCategories, cat]);

                          setCategorySearch("");
                          setShowCategoryDropdown(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-orange-100"
                      >
                        {cat.name}
                      </div>
                    ))}
                </div>
              )}

              {/* Tag danh mục */}
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat.category_id}
                    className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center"
                  >
                    {cat.name}
                    <button
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          prev.filter((c) => c.category_id !== cat.category_id)
                        )
                      }
                      type="button"
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
              <label className="font-semibold block mb-2">Nguyên liệu</label>
              <input
                type="text"
                placeholder="Tìm nguyên liệu..."
                value={ingredientSearch}
                onFocus={() => setShowIngredientDropdown(true)}
                onChange={(e) => setIngredientSearch(e.target.value.toLowerCase())}
                className="w-full border rounded-lg px-4 py-3"
              />

              {showIngredientDropdown && (
                <div className="absolute bg-white shadow border w-full rounded-lg mt-1 max-h-48 overflow-y-auto z-20">
                  {ingredients
                    .filter((ing) => ing.name.toLowerCase().includes(ingredientSearch))
                    .map((ing) => (
                      <div
                        key={ing.ingredient_id}
                        onClick={() => {
                          if (
                            !selectedIngredients.find(
                              (x) => x.ingredient_id === ing.ingredient_id
                            )
                          )
                            setSelectedIngredients([
                              ...selectedIngredients,
                              { ingredient_id: ing.ingredient_id, quantity: "" },
                            ]);

                          setIngredientSearch("");
                          setShowIngredientDropdown(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-orange-100"
                      >
                        {ing.name}
                      </div>
                    ))}
                </div>
              )}

              {/* Tag nguyên liệu */}
              <div className="mt-3 space-y-2">
                {selectedIngredients.map((sel) => {
                  const ing = ingredients.find((i) => i.ingredient_id === sel.ingredient_id);
                  return (
                    <div
                      key={sel.ingredient_id}
                      className="border bg-orange-50 rounded-lg px-3 py-2 flex justify-between items-center"
                    >
                      <span>
                        {ing?.name}
                        <span className="ml-1 text-gray-600">{ing?.unit}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <input
                          className="border rounded px-2 py-1 text-sm w-24"
                          value={sel.quantity}
                          onChange={(e) =>
                            handleQuantityChange(sel.ingredient_id, e.target.value)
                          }
                          placeholder="SL"
                        />
                        <button
                          className="text-red-500"
                          type="button"
                          onClick={() =>
                            setSelectedIngredients((prev) =>
                              prev.filter((x) => x.ingredient_id !== sel.ingredient_id)
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ẢNH CHÍNH */}
            <div>
              <label className="font-semibold block mb-2">Ảnh chính</label>
              <label className="cursor-pointer bg-orange-50 border border-orange-300 text-orange-600 px-4 py-3 rounded-lg flex gap-2 items-center hover:bg-orange-100">
                <ImageIcon className="h-5 w-5" />
                Chọn ảnh
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>

              {mainImagePreview && (
                <img
                  src={mainImagePreview}
                  className="h-48 mt-3 rounded-lg object-cover shadow"
                />
              )}
            </div>

            {/* STEPS */}
            <div>
              <h2 className="font-semibold text-lg mb-3">Các bước nấu</h2>

              {steps.map((step, idx) => (
                <div key={idx} className="border rounded-xl p-4 mb-4 bg-white shadow-sm">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">Bước {idx + 1}</h3>

                    {steps.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() =>
                          setSteps((prev) => {
                            const arr = [...prev];
                            const removed = arr[idx];

                            if (removed.step_id) {
                              setDeletedStepIds((old) => [...old, removed.step_id!]);
                            }

                            return arr.filter((_, i) => i !== idx);
                          })
                        }
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Instruction */}
                  <textarea
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 mt-3"
                    value={step.instruction}
                    onChange={(e) => {
                      const arr = [...steps];
                      arr[idx].instruction = e.target.value;
                      setSteps(arr);
                    }}
                    placeholder="Mô tả bước nấu"
                  />

                  {/* Existing images */}
                  {step.existingImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {step.existingImages.map((img) => (
                        <div key={img.image_id} className="relative group">
                          <img
                            src={img.image_url}
                            className="h-24 w-full object-cover rounded-lg border"
                          />
                          <button
                            className="absolute top-1 right-1 bg-black/60 text-white px-2 rounded-full text-xs opacity-0 group-hover:opacity-100"
                            type="button"
                            onClick={() =>
                              setSteps((prev) => {
                                const arr = [...prev];
                                arr[idx].imagesToDelete.push(img.image_id);
                                arr[idx].existingImages = arr[idx].existingImages.filter(
                                  (x) => x.image_id !== img.image_id
                                );
                                return arr;
                              })
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New images */}
                  {step.newImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {step.newImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            className="h-24 w-full object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/60 text-white px-2 rounded-full text-xs opacity-0 group-hover:opacity-100"
                            onClick={() =>
                              setSteps((prev) => {
                                const arr = [...prev];
                                arr[idx].newImages = arr[idx].newImages.filter(
                                  (_, j) => j !== i
                                );
                                return arr;
                              })
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new images */}
                  <label className="cursor-pointer bg-orange-50 border border-orange-300 text-orange-600 px-3 py-2 rounded-lg flex gap-2 items-center hover:bg-orange-100 w-max mt-3">
                    <ImageIcon className="h-5 w-5" />
                    Thêm ảnh
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSteps((prev) => {
                          const arr = [...prev];
                          arr[idx].newImages = [...arr[idx].newImages, ...files];
                          return arr;
                        });
                      }}
                    />
                  </label>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setSteps((prev) => [
                    ...prev,
                    { instruction: "", existingImages: [], imagesToDelete: [], newImages: [] },
                  ])
                }
                className="flex items-center text-orange-600 hover:text-orange-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm bước
              </button>
            </div>

            {/* Submit */}
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
                <Save className="w-5 h-5 mr-2" />
                {loading ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
