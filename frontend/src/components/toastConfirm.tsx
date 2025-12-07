import toast from "react-hot-toast";

export function toastConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const t = toast(
      (toastItem) => (
        <div className="flex flex-col">
          <span className="font-semibold">{message}</span>

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                toast.dismiss(toastItem.id);
                resolve(false);
              }}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              Hủy
            </button>

            <button
              onClick={() => {
                toast.dismiss(toastItem.id);
                resolve(true);
              }}
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Xóa
            </button>
          </div>
        </div>
      ),
      {
        duration: 999999,
      }
    );
  });
}
