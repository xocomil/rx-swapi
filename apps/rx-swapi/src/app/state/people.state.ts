import { Injectable, inject } from '@angular/core';
import {
  dictionaryToArray,
  toDictionary,
  update,
} from '@rx-angular/cdk/transformations';
import { RxState } from '@rx-angular/state';
import { create } from 'mutative';
import { Subject, switchMap, tap } from 'rxjs';
import { PeopleMetaData } from '../models/api-response';
import { PeoplePerson, Person } from '../models/person.model';
import { StarWarsApiService } from '../services/star-wars-api.service';

type PeopleState = {
  cachedData: {
    [key: string]: {
      metaData: PeopleMetaData;
      people: PeoplePerson[];
      url: string;
    };
  };
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
  readonly #getPeople$ = new Subject<string | undefined>();

  readonly metaData$ = this.select('metaData');
  readonly previous$ = this.select('metaData', 'previous');
  readonly next$ = this.select('metaData', 'next');
  readonly people$ = this.select('people');
  readonly selectedPerson$ = this.select('selectedPerson');
  readonly cachedData$ = this.select('cachedData');

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
      this.#getPeople$.pipe(
        switchMap((url) => this.#swapiService.getPeople(url)),
        tap()
      ),
      (oldState, { results: people, ...metaData }) =>
        create(oldState, (draft) => {
          draft.people = people;
          draft.metaData = metaData;
          draft.cachedData = toDictionary(
            update(dictionaryToArray(oldState.cachedData), {
              people,
              metaData,
              url: metaData.url,
            }),
            'url'
          );
        })
    );
  }

  getPeople(url?: string) {
    this.#getPeople$.next(url);
  }
}
