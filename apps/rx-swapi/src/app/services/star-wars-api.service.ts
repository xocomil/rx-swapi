import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { create } from 'mutative';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response';

const API_ROOT = 'https://swapi.tech/api';
const PEOPLE_URL = `${API_ROOT}/people`;

@Injectable({
  providedIn: 'root',
})
export class StarWarsApiService {
  readonly #httpClient = inject(HttpClient);

  getPeople(url = PEOPLE_URL): Observable<ApiResponse> {
    return this.#httpClient.get<ApiResponse>(url).pipe(
      map((response) => {
        return create(response, (draft) => {
          draft.url = url;
        });
      })
    );
  }
}
