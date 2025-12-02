import React, { useState } from "react";
import { ingredientRequestAPI } from "../services/api";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import bg from "../img/home_background.jpeg"
import head_bg from "../img/fav_head.jpg"

const BACKGROUND = bg ;
const HEAD_BG = head_bg;

export function RequestIngredientForm() {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState(""); // 🆕 thêm unit
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nguyên liệu");
      return;
    }

    if (!unit.trim()) {
      toast.error("Vui lòng nhập đơn vị nguyên liệu");
      return;
    }

    setLoading(true);

    try {
      // ✔ Giữ nguyên API logic, chỉ thêm unit vào body
      await ingredientRequestAPI.request({
        ingredient_name: name.trim(),
        unit: unit.trim(),
        reason,
      });

      toast.success("Đã gửi yêu cầu nguyên liệu — cảm ơn bạn!");

      setName("");
      setUnit("");
      setReason("");

    } catch (err) {
      console.error(err);
      toast.error("Gửi yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      {/* LAYER MỜ + BLUR */}
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">

        {/* HEADER BẰNG ẢNH */}
        <div
          className="relative h-52 bg-cover bg-center shadow-lg rounded-b-3xl"
          style={{ backgroundImage: `url(${HEAD_BG})` }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-b-3xl"></div>

          <div className="absolute inset-0 flex flex-col justify-center px-8 max-w-5xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg flex items-center gap-3">
              <PlusCircle className="h-10 w-10" />
              Yêu cầu thêm nguyên liệu
            </h1>
            <p className="text-orange-100 mt-1 text-lg drop-shadow">
              Gửi yêu cầu để admin thêm nguyên liệu mới vào hệ thống
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="max-w-xl mx-auto px-6 py-10">
          <form
            onSubmit={submit}
            className="bg-white p-8 rounded-2xl shadow-xl space-y-6 border"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thông tin nguyên liệu
            </h2>

            {/* INPUT NAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên nguyên liệu <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-orange-500"
                placeholder="Ví dụ: Bột matcha"
              />
            </div>

            {/* INPUT UNIT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Đơn vị <span className="text-red-500">*</span>
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 block w-full border rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-orange-500"
                placeholder="Ví dụ: gram, ml, muỗng..."
              />
            </div>

            {/* INPUT REASON */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Lý do (tùy chọn)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full border rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Bạn cần nguyên liệu này để làm món..."
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
