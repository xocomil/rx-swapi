import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';
import { PeoplePerson } from '../models/person.model';

const API_ROOT = 'https://swapi.tech/api';

@Injectable({
  providedIn: 'root',
})
export class StarWarsApiService {
  readonly #httpClient = inject(HttpClient);

  getPeople(): Observable<PeoplePerson[]> {
    return this.#httpClient
      .get<ApiResponse>(`${API_ROOT}/people`)
      .pipe(map((res) => res.results));
  }
}
