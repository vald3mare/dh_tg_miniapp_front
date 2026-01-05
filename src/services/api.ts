// API базовая конфигурация
const API_URL = (typeof window !== 'undefined' && (window as any).__API_URL__) || 'http://localhost:3000';

interface LoginResponse {
  token: string;
  user: { id: string; [key: string]: any };
  [key: string]: any;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // 🔐 AUTH
  async login(initData: string) {
    const response = await apiCall<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ initData }),
    });
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.user.id);
    }
    return response;
  },

  async validateToken(token: string) {
    return apiCall('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // 👤 USERS
  async getProfile(userId: string) {
    return apiCall(`/users/${userId}`);
  },

  async updateProfile(userId: string, data: any) {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 🐕 PETS
  async getPets(userId: string) {
    return apiCall(`/pets/user/${userId}`);
  },

  async getPet(petId: string) {
    return apiCall(`/pets/${petId}`);
  },

  async createPet(data: any) {
    return apiCall('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePet(petId: string, data: any) {
    return apiCall(`/pets/${petId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePet(petId: string) {
    return apiCall(`/pets/${petId}`, {
      method: 'DELETE',
    });
  },

  // 🛎️ SERVICES
  async getServices() {
    return apiCall('/services');
  },

  async getService(serviceId: string) {
    return apiCall(`/services/${serviceId}`);
  },

  // 💰 TARIFFS
  async getTariffs() {
    return apiCall('/tariffs');
  },

  async getTariff(tariffId: string) {
    return apiCall(`/tariffs/${tariffId}`);
  },

  // 💳 PAYMENTS
  async createPayment(userId: string, tariffId: string, amount: number) {
    return apiCall('/orders/create-payment', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        tariffId,
        amount,
        description: `Подписка на тариф`,
      }),
    });
  },

  async getOrders(userId: string) {
    return apiCall(`/orders/user/${userId}`);
  },

  async getOrder(orderId: string) {
    return apiCall(`/orders/${orderId}`);
  },

  async cancelSubscription(userId: string) {
    return apiCall(`/orders/cancel-subscription/${userId}`, {
      method: 'DELETE',
    });
  },

  // LOGOUT
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  },
};

export default api;
