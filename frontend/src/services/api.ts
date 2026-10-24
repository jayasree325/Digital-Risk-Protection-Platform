import { Finding, FindingStatus, LinkCheckRecord, User, Company, BrandAsset } from '../types';

const TOKEN_KEY = 'brandguard_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    const message = errorData.message || errorData.error || `HTTP error ${response.status}`;
    const err = new Error(message);
    (err as any).status = response.status;
    throw err;
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; company: Company }> {
    const data = await request<{ token: string; user: User; company: Company }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    website?: string;
    industry?: string;
  }): Promise<{ token: string; user: User; company: Company }> {
    const res = await request<{ token: string; user: User; company: Company }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User; company: Company }> {
    return request<{ user: User; company: Company }>('/api/auth/me');
  },

  async forgotPassword(email: string): Promise<{ message: string; demoToken?: string }> {
    return request<{ message: string; demoToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/auth/delete-account', {
      method: 'POST',
    });
  },

  logout(): void {
    setStoredToken(null);
  },

  // Company
  async getCompany(companyId?: string): Promise<Company> {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<Company>(`/api/company${q}`);
  },

  async getCompanyList(): Promise<Company[]> {
    return request<Company[]>('/api/company/list');
  },

  async switchCompany(companyId: string): Promise<{ message: string; token: string; company: Company; user: User }> {
    const res = await request<{ message: string; token: string; company: Company; user: User }>('/api/company/switch', {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    });
    setStoredToken(res.token);
    return res;
  },

  async updateCompany(data: Partial<Company>): Promise<{ message: string }> {
    return request('/api/company', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getCompleteness(companyId?: string): Promise<{ completenessPercent: number }> {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request(`/api/company/completeness${q}`);
  },

  // Assets
  async getAssets(companyId?: string): Promise<BrandAsset[]> {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<BrandAsset[]>(`/api/assets${q}`);
  },

  async createAsset(data: Partial<BrandAsset>): Promise<{ message: string; asset: BrandAsset }> {
    return request('/api/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyAsset(id: string, method?: string): Promise<{ message: string }> {
    return request(`/api/assets/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verificationMethod: method || 'company_confirmation' }),
    });
  },

  async deleteAsset(id: string): Promise<{ message: string }> {
    return request(`/api/assets/${id}`, {
      method: 'DELETE',
    });
  },

  // Link Checks
  async checkLink(url: string, companyId?: string): Promise<LinkCheckRecord> {
    return request<LinkCheckRecord>('/api/link-checks', {
      method: 'POST',
      body: JSON.stringify({ url, companyId }),
    });
  },

  async getLinkChecks(companyId?: string): Promise<LinkCheckRecord[]> {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<LinkCheckRecord[]>(`/api/link-checks${q}`);
  },

  async addLinkCheckToFindings(id: string): Promise<{ message: string; findingId: string }> {
    return request(`/api/link-checks/${id}/add-to-findings`, {
      method: 'POST',
    });
  },

  // Findings
  async getFindings(params?: { type?: string; severity?: string; status?: string; search?: string; companyId?: string }): Promise<Finding[]> {
    const q = new URLSearchParams();
    if (params?.type && params.type !== 'all') q.set('type', params.type);
    if (params?.severity && params.severity !== 'all') q.set('severity', params.severity);
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.companyId) q.set('companyId', params.companyId);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<Finding[]>(`/api/findings${queryStr}`);
  },

  async getFinding(id: string): Promise<Finding> {
    return request<Finding>(`/api/findings/${id}`);
  },

  async updateFindingStatus(id: string, status: FindingStatus, note?: string): Promise<{ message: string; status: FindingStatus }> {
    return request(`/api/findings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  async addFindingNote(id: string, text: string): Promise<{ message: string; note: any }> {
    return request(`/api/findings/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Dashboard
  async getDashboardSummary(companyId?: string): Promise<{
    openFindings: number;
    criticalFindings: number;
    highRiskFindings: number;
    socialFindings: number;
    appFindings: number;
    verifiedAssets: number;
  }> {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request(`/api/dashboard/summary${q}`);
  },

  async getDashboardSeverity(companyId?: string): Promise<{
    total: number;
    breakdown: Array<{ label: string; severity: string; count: number; pct: number; color: string }>;
  }> {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request(`/api/dashboard/severity${q}`);
  },

  async getDashboardTrends(companyId?: string): Promise<Array<{ day: string; social: number; apps: number; total: number }>> {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request(`/api/dashboard/trends${q}`);
  },

  // Scans
  async runSocialScan(companyId?: string): Promise<{ message: string; findingId: string; title: string }> {
    return request('/api/scans/social', {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    });
  },

  async runAppScan(companyId?: string): Promise<{ message: string; findingId: string; title: string }> {
    return request('/api/scans/apps', {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    });
  },

  async runGoogleScan(companyId?: string): Promise<{
    message: string;
    sourceStatus: string;
    status: string;
    findingsCount: number;
    findingIds: string[];
    notice: string;
  }> {
    return request('/api/scans/google', {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    });
  },

  async getGoogleDiscoveryStatus(): Promise<{
    configured: boolean;
    searchEngineIdConfigured: boolean;
    webRiskConfigured: boolean;
    discoverySource: string;
    status: string;
    sourceStatus: string;
    notice: string;
    isLiveAvailable: boolean;
  }> {
    return request('/api/scans/google/status');
  },


  async getInstagramStatus(): Promise<{
    configured: boolean;
    platform: string;
    status: string;
    mode: string;
    isLiveAvailable: boolean;
    notice: string;
  }> {
    return request('/api/scans/instagram/status');
  },

  async connectInstagram(companyId?: string): Promise<{
    success: boolean;
    message: string;
    account: {
      id: string;
      username: string;
      handle: string;
      url: string;
      accountType: string;
      verificationStatus: string;
      verificationMethod: string;
      syncedAt: string;
    };
    assetId: string;
  }> {
    return request('/api/company/instagram/connect', {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    });
  },

  async getConnectedInstagram(companyId?: string): Promise<{
    connected: boolean;
    username?: string;
    handle?: string;
    id?: string;
    accountType?: string;
    profileUrl?: string;
    verificationStatus?: string;
    verificationMethod?: string;
    isLiveSynced?: boolean;
    assetId?: string;
    lastSync?: string;
    error?: string;
    message?: string;
  }> {
    const q = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request(`/api/company/instagram/connected${q}`);
  },

  async disconnectInstagram(companyId?: string): Promise<{ success: boolean; message: string }> {
    return request('/api/company/instagram/disconnect', {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    });
  },

  // AI Intelligence Endpoints (Powered by NVIDIA NIM)
  async getAiStatus(): Promise<{
    configured: boolean;
    provider: string;
    model: string;
    mode: string;
    notice: string;
  }> {
    return request('/api/ai/status');
  },

  async askAegisAI(query: string, context?: any): Promise<{
    success: boolean;
    query: string;
    answer: string;
    model: string;
    provider: string;
  }> {
    return request('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
  },

  async analyzeScamScriptAI(text: string, companyName?: string): Promise<{
    success: boolean;
    analysis: {
      scamScore: number;
      confidence: 'High' | 'Medium' | 'Low';
      threatVerdict: string;
      urgencyLevel: string;
      summary: string;
      detectedTactics: Array<{
        name: string;
        severity: 'critical' | 'high' | 'medium';
        weight: number;
        matchedSnippet: string;
        explanation: string;
      }>;
      redFlags: string[];
      recommendedAction: string;
    };
    model: string;
    provider: string;
  }> {
    return request('/api/ai/analyze-scam', {
      method: 'POST',
      body: JSON.stringify({ text, companyName }),
    });
  },
};
