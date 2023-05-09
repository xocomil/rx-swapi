import { Injectable, inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { select } from '@rx-angular/state/selections';
import { create } from 'mutative';
import {
  EMPTY,
  Subject,
  catchError,
  exhaustMap,
  filter,
  map,
  of,
  tap,
  withLatestFrom,
} from 'rxjs';
import { PeopleMetaData } from '../models/api-response';
import { PeoplePerson, Person } from '../models/person.model';
import { StarWarsApiService } from '../services/star-wars-api.service';

type LoadingState = {
  state: 'loading';
};

const createLoadingState = (): LoadingState => ({ state: 'loading' });

type SuccessState = {
  state: 'success';
  message?: string;
};

const createSuccessState = (message?: string): SuccessState => ({
  state: 'success',
  message,
});

type ErrorState = {
  state: 'error';
  message: string;
};

const createErrorState = (message = 'Something bad happened!'): ErrorState => ({
  state: 'error',
  message,
});

type PendingState = {
  state: 'pending';
};

type PeopleState = {
  cachedData: Map<string, { metaData: PeopleMetaData; people: PeoplePerson[] }>;
  selectedPage: string;
  selectedPerson: Person;
  loadingState: LoadingState | ErrorState | SuccessState | PendingState;
};

const initialState = (): Partial<PeopleState> => ({
  cachedData: new Map(),
  loadingState: {
    state: 'pending',
  },
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
  readonly #metaData$ = this.#currentPage$.pipe(select('metaData'));
  readonly previous$ = this.#metaData$.pipe(select('previous'));
  readonly next$ = this.#metaData$.pipe(select('next'));
  readonly people$ = this.#currentPage$.pipe(select('people'));
  readonly selectedPerson$ = this.select('selectedPerson');
  readonly #cachedData$ = this.select('cachedData');

  readonly showSpinner$ = this.select(
    'loadingState',
    ({ state }) => state === 'loading'
  );

  readonly showError$ = this.select('loadingState', (loadingState) => {
    if (loadingState.state === 'error') {
      return {
        show: true,
        message: loadingState.message,
      };
    }

    return {
      show: false,
    };
  });

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
        tap(() => {
          this.set({ loadingState: createLoadingState() });
        }),
        withLatestFrom(this.#cachedData$),
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
            })),
            catchError((err) => {
              console.error('error', err);

              this.set({ loadingState: createErrorState() });

              return EMPTY;
            })
          );
        })
      ),
      (oldState, { people, metaData, url }) =>
        create(oldState, (draft) => {
          if (!oldState.cachedData.has(url ?? '')) {
            draft.cachedData.set(url ?? '', { metaData, people });
          }

          draft.loadingState = createSuccessState();
          draft.selectedPage = url ?? '';
        })
    );
  }

  getPeople(url?: string) {
    this.#getPeople$.next(url);
  }
}
