const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  register: async (name, email, password, coordinates) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, coordinates })
    });
    return response.json();
  },
  
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Items API
export const itemsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/items`);
    return response.json();
  },
  
  getNearby: async (lng, lat, maxDistance = 5000, category = null) => {
    let url = `${API_BASE_URL}/items/nearby?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`;
    if (category) url += `&category=${category}`;
    const response = await fetch(url);
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`);
    return response.json();
  },
  
  create: async (itemData) => {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return response.json();
  },
  
  update: async (id, itemData) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Requests API
export const requestsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/requests`);
    return response.json();
  },
  
  getNearby: async (lng, lat, maxDistance = 5000) => {
    const response = await fetch(`${API_BASE_URL}/requests/nearby?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`);
    return response.json();
  },
  
  create: async (requestData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(requestData)
    });
    return response.json();
  },
  
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Users API
export const usersAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },
  
  getProfile: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return response.json();
  },
  
  updatePoints: async (id, points) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/points`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points })
    });
    return response.json();
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    return response.json();
  },
  
  getUserTransactions: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`);
    return response.json();
  },
  
  create: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return response.json();
  },
  
  update: async (id, transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return response.json();
  }
};
