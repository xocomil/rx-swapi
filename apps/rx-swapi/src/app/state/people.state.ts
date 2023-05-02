import { Injectable, inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { Subject, map, switchMap } from 'rxjs';
import { PeoplePerson, Person } from '../models/person.model';
import { StarWarsApiService } from '../services/star-wars-api.service';

type PeopleState = {
  people: PeoplePerson[];
  selectedPerson: Person;
};

const initialState = (): Partial<PeopleState> => ({
  people: [],
});

@Injectable()
export class PeopleStateService extends RxState<PeopleState> {
  readonly #swapiService = inject(StarWarsApiService);
  readonly #getPeople$ = new Subject<void>();

  readonly people$ = this.select('people');
  readonly selectedPerson$ = this.select('selectedPerson');

  constructor() {
    super();

    this.set(initialState());

    this.connect(
      this.#getPeople$.pipe(
        switchMap(() => this.#swapiService.getPeople()),
        map((people) => ({ people }))
      )
    );
  }

  getPeople() {
    this.#getPeople$.next();
  }
}
