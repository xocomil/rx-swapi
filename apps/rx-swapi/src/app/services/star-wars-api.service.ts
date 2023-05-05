import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';

const API_ROOT = 'https://swapi.tech/api';

@Injectable({
  providedIn: 'root',
})
export class StarWarsApiService {
  readonly #httpClient = inject(HttpClient);

  getPeople(): Observable<ApiResponse> {
    return this.#httpClient.get<ApiResponse>(`${API_ROOT}/people`);
  }
}
