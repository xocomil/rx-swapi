import { Injectable, inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { select } from '@rx-angular/state/selections';
import { create } from 'mutative';
import { Subject, exhaustMap, filter, map, of, withLatestFrom } from 'rxjs';
import { PeopleMetaData } from '../models/api-response';
import { PeoplePerson, Person } from '../models/person.model';
import { StarWarsApiService } from '../services/star-wars-api.service';

type PeopleState = {
  cachedData: Map<string, { metaData: PeopleMetaData; people: PeoplePerson[] }>;
  selectedPage: string;
  selectedPerson: Person;
};

const initialState = (): Partial<PeopleState> => ({
  cachedData: new Map(),
});

@Injectable()
export class PeopleStateService extends RxState<PeopleState> {
  readonly #swapiService = inject(StarWarsApiService);
  readonly #getPeople$ = new Subject<string | undefined>();

  readonly #selectedPage$ = this.select('selectedPage');
  readonly #currentPage$ = this.select(
    withLatestFrom(this.#selectedPage$),
    map(([state, selectedPage]) => state.cachedData.get(selectedPage)),
    filter(Boolean)
  );
  readonly metaData$ = this.#currentPage$.pipe(select('metaData'));
  readonly previous$ = this.metaData$.pipe(select('previous'));
  readonly next$ = this.metaData$.pipe(select('next'));
  readonly people$ = this.#currentPage$.pipe(select('people'));
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
        withLatestFrom(this.cachedData$),
        exhaustMap(([url, cachedData]) => {
          const cachedPage = cachedData.get(url ?? '');

          if (cachedPage) {
            return of({ ...cachedPage, url });
          }

          return this.#swapiService.getPeople(url).pipe(
            map(({ results: people, ...metaData }) => ({
              people,
              metaData,
              url,
            }))
          );
        })
      ),
      (oldState, { people, metaData, url }) =>
        create(oldState, (draft) => {
          if (!oldState.cachedData.has(url ?? '')) {
            draft.cachedData.set(url ?? '', { metaData, people });
          }

          draft.selectedPage = url ?? '';
        })
    );
  }

  getPeople(url?: string) {
    this.#getPeople$.next(url);
  }
}
