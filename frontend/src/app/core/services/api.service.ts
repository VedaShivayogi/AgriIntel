import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API_BASE = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // --- Auth ---
  register(payload: any) { return this.http.post(`${API_BASE}/auth/register`, payload); }
  login(payload: any)    { return this.http.post(`${API_BASE}/auth/login`, payload); }

  // --- Farms ---
  listFarms()                { return this.http.get<any[]>(`${API_BASE}/farms`); }
  createFarm(payload: any)   { return this.http.post(`${API_BASE}/farms`, payload); }

  // --- Plots ---
  listPlots(farmId?: number) {
    const params = farmId ? new HttpParams().set('farm_id', farmId) : undefined;
    return this.http.get<any[]>(`${API_BASE}/plots`, { params });
  }
  createPlot(payload: any)   { return this.http.post(`${API_BASE}/plots`, payload); }
  getPlot(id: number)        { return this.http.get<any>(`${API_BASE}/plots/${id}`); }

  // --- Soil ---
  createSoilTest(payload: any)      { return this.http.post(`${API_BASE}/soil-tests`, payload); }
  listSoilTests(plotId: number)     { return this.http.get<any[]>(`${API_BASE}/soil-tests/${plotId}`); }
  soilHealth(plotId: number)        { return this.http.get<any>(`${API_BASE}/soil-tests/${plotId}/health`); }

  // --- Weather ---
  weather(plotId: number)           { return this.http.get<any>(`${API_BASE}/weather/${plotId}`); }

  // --- Crop ---
  recommendCrop(payload: any)       { return this.http.post<any>(`${API_BASE}/crop/recommend`, payload); }

  // --- Yield ---
  predictYield(payload: any)        { return this.http.post<any>(`${API_BASE}/yield/predict`, payload); }

  // --- Disease ---
  predictDisease(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>(`${API_BASE}/disease/predict`, fd);
  }

  // --- Profit ---
  predictProfit(payload: any)       { return this.http.post<any>(`${API_BASE}/profit/predict`, payload); }

  // --- Risk ---
  predictRisk(payload: any)         { return this.http.post<any>(`${API_BASE}/risk/predict`, payload); }

  // --- What-if ---
  whatIf(payload: any)              { return this.http.post<any>(`${API_BASE}/what-if`, payload); }

  // --- Reports ---
  downloadFarmReport(farmId: number) {
    return this.http.get(`${API_BASE}/reports/farm/${farmId}`, { responseType: 'blob' });
  }

  // --- Research ---
  researchMetrics()                 { return this.http.get<any>(`${API_BASE}/research/metrics`); }
}
