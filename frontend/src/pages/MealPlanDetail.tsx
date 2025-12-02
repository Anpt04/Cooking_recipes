import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mealPlanAPI, recipeAPI, shoppingListAPI } from "../services/api";
import { toast } from "sonner";
import { Save, ShoppingCart, Plus, X, CalendarDays, ArrowLeft } from "lucide-react";

import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

(pdfMake as any).vfs = pdfFonts.vfs;

// ẢNH BACKGROUND + HEADER
import bg from "../img/home_background.jpeg"
import head_bg from "../img/fav_head.jpg"

const BACKGROUND = bg ;
const HEAD_BG = head_bg;

export default function MealPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [tempMeals, setTempMeals] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMealTime, setSelectedMealTime] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const mealTimes = ["Sáng", "Trưa", "Tối"];

  const toDateLocal = (d: Date) => d.toISOString().split("T")[0];

  const convertMealType = (label: string) =>
    label === "Sáng" ? "Breakfast" : label === "Trưa" ? "Lunch" : "Dinner";

  const convertMealTypeReverse = (type: string) =>
    type.toLowerCase().includes("break") ? "Sáng" :
    type.toLowerCase().includes("lunch") ? "Trưa" : "Tối";

  const getDayLabel = (d: Date) =>
    ["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"][d.getDay()];

  useEffect(() => {
    fetchPlan();
    fetchAllRecipes();
  }, [id]);

  const fetchAllRecipes = async () => {
    try {
      const res = await recipeAPI.getAll();
      const list = res.data?.recipes ?? res.data ?? [];
      setAllRecipes(list);
    } catch {
      toast.error("Không thể tải danh sách món ăn");
    }
  };

  const fetchPlan = async () => {
    try {
      const plan = await mealPlanAPI.getById(id!);

      if (!plan) {
        toast.error("Không tìm thấy kế hoạch");
        return;
      }

      setStartDate(new Date(plan.start_date));
      setEndDate(new Date(plan.end_date));

      if (!plan.recipes) {
        setRecipes([]);
        return;
      }

      const mapped = plan.recipes.map((item: any) => {
        const mp = item.MealPlanRecipe;
        return {
          recipe_id: mp.recipe_id,
          title: item.title,
          date: (mp.scheduled_date || "").split("T")[0],
          meal_time: convertMealTypeReverse(mp.meal_type),
          isTemp: false,
        };
      });

      setRecipes(mapped);

    } catch (err) {
      console.error("FETCH ERROR:", err);
      toast.error("Không thể tải kế hoạch");
    }
  };

  const getDates = () => {
    if (!startDate || !endDate) return [];

    const arr: Date[] = [];
    const cur = new Date(startDate);
    const end = new Date(endDate);

    while (cur <= end) {
      arr.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  };

  const getRecipesFor = (date: Date, meal: string) => {
    const d = toDateLocal(date);

    const saved = recipes.filter((r) => r.date === d && r.meal_time === meal);

    const temp = tempMeals
      .filter((t) => t.date === d && t.meal_time === meal)
      .map((t) => ({
        recipe_id: t.recipe.recipe_id,
        title: t.recipe.title,
        date: t.date,
        meal_time: t.meal_time,
        isTemp: true,
      }));

    return [...saved, ...temp];
  };

  const handleAddRecipe = (recipe: any) => {
    const d = toDateLocal(selectedDate!);

    if (tempMeals.some((t) =>
      t.recipe.recipe_id === recipe.recipe_id &&
      t.date === d &&
      t.meal_time === selectedMealTime
    )) {
      return toast.warning("Món đã tồn tại");
    }

    setTempMeals([...tempMeals, { recipe, date: d, meal_time: selectedMealTime }]);
    setShowDialog(false);
  };

  const handleDeleteRecipe = async (item: any) => {
    if (item.isTemp) {
      setTempMeals(tempMeals.filter((t) =>
        !(t.recipe.recipe_id === item.recipe_id &&
          t.date === item.date &&
          t.meal_time === item.meal_time)
      ));
      return;
    }

    try {
      await mealPlanAPI.removeRecipe(id!, item.recipe_id);
      toast.success("Đã xoá món");
      fetchPlan();
    } catch {
      toast.error("Không thể xoá");
    }
  };

  const handleSave = async () => {
    try {
      for (const t of tempMeals) {
        await mealPlanAPI.addRecipe(id!, {
          recipe_id: t.recipe.recipe_id,
          meal_type: convertMealType(t.meal_time),
          scheduled_date: t.date,
        });
      }

      toast.success("Đã lưu");
      setTempMeals([]);
      fetchPlan();
    } catch {
      toast.error("Lưu thất bại");
    }
  };

  const handlePDF = async () => {
    try {
      await shoppingListAPI.generate(id!);
      const res = await shoppingListAPI.get(id!);
      const list = Array.isArray(res) ? res : res?.data ?? [];

      if (!list || list.length === 0) {
        toast.error("Không có nguyên liệu");
        return;
      }

      const merged: Record<string, { name: string; qty: number; unit: string }> = {};

      list.forEach((i: any) => {
        const rawName = i.Ingredient?.name || "Không rõ";
        const rawUnit = i.unit || "";
        const nameKey = rawName.trim().toLowerCase();
        const unitKey = rawUnit.trim().toLowerCase();
        const key = `${nameKey}_${unitKey}`;
        const qty = parseFloat(String(i.quantity).replace(",", ".")) || 0;

        if (!merged[key]) merged[key] = { name: rawName, qty: 0, unit: rawUnit };
        merged[key].qty += qty;
      });

      const body = [
        ["Nguyên liệu", "Số lượng", "Đơn vị"],
        ...Object.values(merged).map((m) => [
          m.name,
          Number.isInteger(m.qty) ? String(m.qty) : String(+m.qty.toFixed(3)),
          m.unit || "",
        ]),
      ];

      const docDefinition = {
        content: [
          { text: "Danh sách mua sắm", style: "header", margin: [0, 0, 0, 12] },
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto", "auto"],
              body,
            },
          },
        ],
        styles: {
          header: { fontSize: 16, bold: true },
        },
        pageSize: "A4",
        pageMargins: [40, 40, 40, 40],
      };

      pdfMake.createPdf(docDefinition).download("shopping-list.pdf");
      toast.success("Đã xuất PDF");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Không thể tạo PDF");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      {/* LAYER MỜ */}
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">

        {/* HEADER ẢNH */}
        <div
          className="relative h-56 bg-cover bg-center shadow-lg rounded-b-3xl"
          style={{ backgroundImage: `url(${HEAD_BG})` }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-b-3xl"></div>

          <div className="absolute inset-0 flex flex-col justify-center px-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg flex items-center gap-3">
              <CalendarDays className="h-10 w-10" />
              Chi tiết kế hoạch bữa ăn
            </h1>
            <p className="text-orange-100 text-lg drop-shadow mt-1">
              Quản lý thực đơn từng ngày của bạn
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* ACTION BUTTONS */}
          <div className="flex justify-between mb-8">
            <button
              onClick={() => navigate("/meal-plans")}
              className="px-4 py-2 bg-white border rounded-xl shadow flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 flex items-center gap-2"
              >
                <Save size={16} /> Lưu
              </button>

              <button
                onClick={handlePDF}
                className="px-4 py-2 bg-white border rounded-xl shadow flex items-center gap-2 hover:bg-gray-50"
              >
                <ShoppingCart size={16} /> Xuất PDF
              </button>
            </div>
          </div>

          {/* GRID BỮA ĂN */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {getDates().map((date, idx) => (
              <div key={idx} className="bg-white border rounded-2xl shadow p-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500">{getDayLabel(date)}</div>
                  <div className="text-3xl font-bold text-orange-600">{date.getDate()}</div>
                </div>

                {mealTimes.map((meal) => (
                  <div key={meal} className="mb-4">
                    <div className="font-bold mb-2 text-gray-800">{meal}</div>

                    {getRecipesFor(date, meal).map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border rounded-xl px-3 py-2 mb-1 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <span className="truncate">{r.title}</span>
                        <button
                          onClick={() => handleDeleteRecipe(r)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedMealTime(meal);
                        setShowDialog(true);
                      }}
                      className="mt-2 w-full bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm py-1.5 rounded-lg border border-orange-200 flex items-center justify-center gap-1 transition"
                    >
                      <Plus size={14} /> Thêm món
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* DIALOG CHỌN MÓN */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-[360px] max-h-[450px] overflow-y-auto shadow-xl">
              <h2 className="font-bold text-lg mb-4">
                Chọn món cho {selectedMealTime}
              </h2>

              {allRecipes.map((r) => (
                <div
                  key={r.recipe_id}
                  onClick={() => handleAddRecipe(r)}
                  className="p-3 border rounded-xl mb-2 hover:bg-gray-100 cursor-pointer transition"
                >
                  {r.title}
                </div>
              ))}

              <button
                onClick={() => setShowDialog(false)}
                className="mt-4 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
