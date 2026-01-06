// Типизация для Vite env переменных
interface ImportMetaEnv {
  VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// API базовая конфигурация
const getAPIURL = () => {
  // Для production на Timeweb из .env (VITE_API_URL)
  // Безопасная проверка чтобы избежать ошибок на старых браузерах
  try {
    if (import.meta?.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
  } catch (e) {
    console.log('env переменная недоступна');
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Для локальной разработки - используем localhost:3000
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
      return 'http://localhost:3000';
    }
    
    // Для production на Timeweb - используем бэкенд домен БЕЗ портов
    return 'https://vald3mare-dh-tg-miniapp-back-9fa8.twc1.net';
  }
  
  return 'https://vald3mare-dh-tg-miniapp-back-9fa8.twc1.net';
};

const API_URL = getAPIURL();

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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Пытаемся спарсить JSON ответ
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Выводим подробную ошибку для отладки
      console.error(`API Error ${response.status}:`, {
        endpoint,
        status: response.statusText,
        data,
      });
      throw new Error(`API error: ${response.statusText} - ${JSON.stringify(data)}`);
    }

    return data as T;
  } catch (error) {
    console.error(`Fetch error on ${endpoint}:`, error);
    throw error;
  }
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
