import { NgForOf, NgIf } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, debounceTime, map } from 'rxjs';
import { PeopleStateService } from './state/people.state';

@Component({
  standalone: true,
  selector: 'rx-swapi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PeopleStateService, MatSnackBar],
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NgForOf,
    NgIf,
    FormsModule,
  ],
})
export class AppComponent implements OnInit {
  readonly #peopleState = inject(PeopleStateService);
  readonly #snackBar = inject(MatSnackBar);

  readonly #filter = signal('');
  readonly #filter$ = toObservable(this.#filter);

  protected readonly people = toSignal(this.#peopleState.people$, {
    initialValue: [],
  });
  protected peopleJson = computed(() => JSON.stringify(this.people(), null, 2));

  protected readonly selectedPerson$ = this.#peopleState.selectedPerson$;
  protected readonly previous = toSignal(this.#peopleState.previous$);
  protected readonly next = toSignal(this.#peopleState.next$);
  protected readonly showSpinner = toSignal(this.#peopleState.showSpinner$, {
    initialValue: true,
  });
  protected readonly showError = toSignal(this.#peopleState.showError$, {
    initialValue: {
      show: false,
      message: undefined,
    },
  });
  protected readonly filteredPeople = toSignal(
    combineLatest([
      this.#filter$.pipe(debounceTime(250)),
      this.#peopleState.allPeople$,
    ]).pipe(
      map(([filter, people]) => {
        // console.log('map', people, filter);

        if (!filter) {
          return people;
        }

        return people.filter((person) =>
          person.name.toLocaleLowerCase().includes(filter)
        );
      })
    ),
    { initialValue: [] }
  );

  constructor() {
    effect(() => {
      if (this.showError().show) {
        this.#snackBar.open(this.showError().message ?? 'meh', 'close');
      }
    });
  }

  ngOnInit(): void {
    this.#peopleState.getPeople();
  }

  protected navigateTo(url: string) {
    this.#peopleState.getPeople(url);
  }

  protected filterPeople(filter: string) {
    this.#filter.set(filter.toLocaleLowerCase());
  }
}
