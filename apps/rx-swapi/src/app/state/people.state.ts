import { Injectable, inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { create } from 'mutative';
import { Subject, switchMap } from 'rxjs';
import { PeopleMetaData } from '../models/api-response';
import { PeoplePerson, Person } from '../models/person.model';
import { StarWarsApiService } from '../services/star-wars-api.service';

type PeopleState = {
  metaData: PeopleMetaData;
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

  readonly metaData$ = this.select('metaData');
  readonly people$ = this.select('people');
  readonly selectedPerson$ = this.select('selectedPerson');

  constructor() {
    super();

    this.set(initialState());

    // only one resource
    // this.connect('people', this.#swapiService.getPeople());

    // Update the existing state (reducer logic)
    // this.connect(
    //   'people',
    //   this.#swapiService.getPeople(),
    //   (oldState, newValue) =>
    //     create(oldState.people, (draft) => {
    //       return draft.concat(newValue);
    //     }) // transform methods
    // );

    // using transform methods
    // this.connect(
    //   'people',
    //   this.#swapiService.getPeople(),
    //   ({ people }, newPeople) =>
    //     update(
    //       people,
    //       newPeople,
    //       (oldPerson, newPerson) => newPerson.uid === oldPerson.uid
    //     ) // transform methods
    // );

    // "Boilerplateless state logic"  -- Michael Hladky

    this.connect(
      this.#getPeople$.pipe(switchMap(() => this.#swapiService.getPeople())),
      (oldState, { results: people, ...metaData }) =>
        create(oldState, (draft) => {
          draft.people = people;
          draft.metaData = metaData;
        })
    );
  }

  getPeople() {
    this.#getPeople$.next();
  }
}
