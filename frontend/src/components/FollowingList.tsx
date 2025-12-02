import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { followAPI } from "../services/api";
import { ArrowLeft } from "lucide-react";

const BACKGROUND =
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg";

export const FollowingList = () => {
  const { id } = useParams<{ id: string }>();
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    followAPI.getFollowing(Number(id)).then((res) => {
      setFollowing(res.data || []);
    });
  }, [id]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">

        {/* HEADER */}
        <div
          className="relative h-52 bg-cover bg-center shadow-lg rounded-b-3xl"
          style={{ backgroundImage: `url(${BACKGROUND})` }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-b-3xl"></div>

          <div className="absolute inset-0 flex flex-col justify-center px-6 max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="text-white flex items-center gap-2 mb-3 hover:text-orange-300"
            >
              <ArrowLeft size={20} />
              Quay lại
            </button>

            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
              Đang theo dõi
            </h1>
            <p className="text-orange-100 mt-1 drop-shadow">
              Danh sách những người bạn đang theo dõi
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          {following.length === 0 ? (
            <p className="text-gray-600 text-center text-lg py-6 bg-white rounded-2xl shadow">
              Bạn chưa theo dõi ai.
            </p>
          ) : (
            <div className="space-y-4">
              {following.map((u: any, i: number) => (
                <Link
                  key={`${u.user_id}-${i}`}
                  to={`/profile/${u.following.user_id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition"
                >
                  <img
                    src={u.following.avatar_url}
                    className="w-14 h-14 rounded-full object-cover border shadow"
                  />

                  <div>
                    <p className="font-semibold text-lg text-gray-900">
                      {u.following.username}
                    </p>
                    <p className="text-gray-500 text-sm">@{u.following.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
