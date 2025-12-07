import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mealPlanAPI } from "../services/api";
import { Calendar, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import bg from "../img/home_background.jpeg"
import head_bg from "../img/fav_head.jpg"

const BACKGROUND = bg ;
const HEAD_BG = head_bg;

export default function MealPlans() {
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const res = await mealPlanAPI.getAll();
      setMealPlans(res || res.mealPlans || []);
    } catch (err) {
      console.error("❌ Lỗi tải kế hoạch:", err);
      toast.error("Không thể tải kế hoạch");
    }
  };

  const handleCreateMealPlan = async () => {
    if (!title || !startDate || !endDate) {
      toast.error("Vui lòng nhập đủ thông tin");
      return;
    }

    try {
      await mealPlanAPI.create({
        title,
        start_date: startDate,
        end_date: endDate,
      });

      toast.success("Đã tạo kế hoạch");
      fetchMealPlans();

      setTitle("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.error("❌ Lỗi tạo kế hoạch:", err);
      toast.error("Không thể tạo kế hoạch");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Bạn có chắc muốn xóa kế hoạch này?")) return;

    try {
      await mealPlanAPI.delete(id);
      toast.success("Đã xóa kế hoạch");
      fetchMealPlans();
    } catch (err) {
      console.error("❌ Lỗi xóa kế hoạch:", err);
      toast.error("Không thể xóa kế hoạch");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      {/* lớp mờ */}
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">

        {/* HEADER ẢNH */}
        <div
          className="relative h-56 bg-cover bg-center shadow-lg"
          style={{ backgroundImage: `url(${HEAD_BG})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
              Kế hoạch bữa ăn
            </h1>
            <p className="text-orange-100 text-lg mt-1 drop-shadow">
              Tạo và quản lý thực đơn hàng ngày của bạn
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto p-6 space-y-10">

          {/* FORM TẠO */}
          <div className="p-6 border rounded-2xl shadow-xl bg-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600">
              <PlusCircle className="h-5 w-5" />
              Tạo kế hoạch mới
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Tiêu đề kế hoạch (vd: Thực đơn chay)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
              />

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateMealPlan}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md"
              >
                Tạo kế hoạch
              </button>
            </div>
          </div>

          {/* DANH SÁCH */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-orange-700">📌 Kế hoạch của bạn</h2>

            {mealPlans.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Chưa có kế hoạch nào.
              </p>
            ) : (
              <div className="space-y-4">
                {mealPlans.map((plan) => {
                  const id = plan.mealplan_id || plan.id;
                  const start = plan.start_date;
                  const end = plan.end_date;

                  return (
                    <div
                      key={id}
                      className="p-5 border rounded-2xl bg-white shadow-lg hover:shadow-xl transition cursor-pointer flex justify-between items-center group"
                    >
                      <Link to={`/meal-plans/${id}`} className="flex-1">
                        <p className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition">
                          {plan.title}
                        </p>

                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          {start} → {end}
                        </p>
                      </Link>

                      <button
                        className="ml-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleDelete(id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
