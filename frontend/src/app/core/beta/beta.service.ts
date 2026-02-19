import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BetaStatus {
    hasAccess: boolean;
    role: string;
}

export interface RedeemResponse {
    success: boolean;
    role: string;
    message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BetaService {
  private apiUrl = `${environment.apiUrl}/beta`;

  constructor(private http: HttpClient) { }

  redeemCode(code: string): Observable<RedeemResponse> {
    return this.http.post<RedeemResponse>(`${this.apiUrl}/redeem`, { code });
  }

  getStatus(): Observable<BetaStatus> {
    return this.http.get<BetaStatus>(`${this.apiUrl}/status`);
  }
}
