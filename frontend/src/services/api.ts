const API_BASE_URL = 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const authAPI = {
  register: async (data: { username: string; email: string; password: string; full_name?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const userAPI = {
  getProfile: async () => {
    
    const token = getAuthToken();
    if (!token) throw new Error("No token found");
      
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Profile API response:", data);
    return data;
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch user profile");
    }

    return response.json(); // ✅ Trả JSON bình thường
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: data, // ✅ ở đây data là FormData, 
    });
    return handleResponse(response);
  },
};

export const categoryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    return handleResponse(response);
  },

  create: async (data: { name: string; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: number, data: { name: string; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const ingredientAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/ingredients`);
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`);
    return handleResponse(response);
  },

  create: async (data: { name: string; unit?: string }) => {
    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: number, data: { name: string; unit?: string }) => {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const recipeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/recipes`);
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
    return handleResponse(response);
  },

  create: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        // ❌ KHÔNG thêm 'Content-Type' vì fetch sẽ tự set boundary cho FormData
      },
      body: formData, // ✅ Gửi trực tiếp FormData
    });

    return handleResponse(response);
  },

  update: async (id: number, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData, // ✅ Gửi trực tiếp FormData
    });

    return handleResponse(response);
  },


  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const recipeStepAPI = {
  getAllByRecipe: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe_step/recipe/${recipeId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe_step/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  create: async (data: { recipe_id: number; step_number: number; instruction: string }) => {
    const response = await fetch(`${API_BASE_URL}/recipe_step`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },


  update: async (id: number, formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/recipe_step/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData, 
  });
  return handleResponse(response);
},


  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe_step/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const recipeImageAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/recipe_images`);
    return handleResponse(response);
  },

  add: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/recipe_images`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  update: async (imageId: number, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/recipe_images/${imageId}`, {
      method: 'PUT',
      body: formData,
    });
    return handleResponse(response);
  },

  delete: async (imageId: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe_images/${imageId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export const favoriteAPI = {
  getByUser: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/favorites/${userId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  add: async (data: { user_id: number; recipe_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  remove: async (userId: number, recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/favorites/${userId}/${recipeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const followAPI = {
  follow: async (data: { follower_id: number; following_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/follows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  unfollow: async (followerId: number, followingId: number) => {
    const response = await fetch(`${API_BASE_URL}/follows/${followerId}/${followingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  getFollowing: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/follows/following/${userId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  getFollowers: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/follows/followers/${userId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const rateAPI = {
  addOrUpdate: async (data: { user_id: number; recipe_id: number; rating: number; comment?: string }) => {
    const response = await fetch(`${API_BASE_URL}/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getByRecipe: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/rates/recipe/${recipeId}`);
    return handleResponse(response);
  },

  delete: async (userId: number, recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/rates/${userId}/${recipeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const recipeIngredientAPI = {
  getByRecipe: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe-ingredients/${recipeId}`);
    return handleResponse(response);
  },

  add: async (data: { recipe_id: number; ingredient_id: number; quantity : string }) => {
    const response = await fetch(`${API_BASE_URL}/recipe-ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (recipe_id: number, ingredient_id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/recipe-ingredients/${recipe_id}/${ingredient_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (recipe_id: number, ingredient_id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe-ingredients/${recipe_id}/${ingredient_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const recipeCategoryAPI = {
  // ➕ Thêm danh mục cho công thức
  add: async (data: { recipe_id: number; category_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/recipe-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // 🔍 Lấy tất cả danh mục của 1 công thức
  getByRecipe: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe-categories/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // ❌ Xóa 1 danh mục khỏi công thức
  delete: async (data: { recipe_id: number; category_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/recipe-categories`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};



