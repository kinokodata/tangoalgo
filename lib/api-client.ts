// フロントエンド用APIクライアント
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  token?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // localStorageから認証トークンを取得
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, token } = options

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
    }

    // 認証トークンを追加
    const authToken = token || this.token
    if (authToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${authToken}`,
      }
    }

    // bodyを追加
    if (body) {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'APIエラーが発生しました')
      }

      return data
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // 認証系API
  async signup(email: string, password: string, username?: string) {
    const response = await this.request('/api/auth/signup', {
      method: 'POST',
      body: { email, password, username },
    })

    if (response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async signin(email: string, password: string) {
    const response = await this.request('/api/auth/signin', {
      method: 'POST',
      body: { email, password },
    })

    if (response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async signout() {
    const response = await this.request('/api/auth/signout', {
      method: 'POST',
    })

    this.clearToken()

    return response
  }

  // カードセット系API
  async getCardSets() {
    return this.request('/api/card-sets')
  }

  async getCardSet(id: string) {
    return this.request(`/api/card-sets/${id}`)
  }

  async createCardSet(title: string, description?: string) {
    return this.request('/api/card-sets', {
      method: 'POST',
      body: { title, description },
    })
  }

  async updateCardSet(id: string, title: string, description?: string) {
    return this.request(`/api/card-sets/${id}`, {
      method: 'PUT',
      body: { title, description },
    })
  }

  async deleteCardSet(id: string) {
    return this.request(`/api/card-sets/${id}`, {
      method: 'DELETE',
    })
  }

  // カード系API
  async getCards(setId: string) {
    return this.request(`/api/cards/set/${setId}`)
  }

  async createCard(cardData: any) {
    return this.request('/api/cards', {
      method: 'POST',
      body: cardData,
    })
  }

  async updateCard(id: string, cardData: any) {
    return this.request(`/api/cards/${id}`, {
      method: 'PUT',
      body: cardData,
    })
  }

  async deleteCard(id: string) {
    return this.request(`/api/cards/${id}`, {
      method: 'DELETE',
    })
  }

  async reorderCards(setId: string, cards: Array<{id: string, display_order: number}>) {
    return this.request(`/api/cards/reorder/${setId}`, {
      method: 'PUT',
      body: { cards },
    })
  }

  // 学習セッション系API
  async startSession(cardSetId: string, options?: any) {
    return this.request('/api/sessions', {
      method: 'POST',
      body: { cardSetId, ...options },
    })
  }

  async updateProgress(sessionId: string, progressData: any) {
    return this.request(`/api/sessions/${sessionId}/progress`, {
      method: 'PUT',
      body: progressData,
    })
  }

  async completeSession(sessionId: string, resultData: any) {
    return this.request(`/api/sessions/${sessionId}/complete`, {
      method: 'PUT',
      body: resultData,
    })
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient()

export default ApiClient