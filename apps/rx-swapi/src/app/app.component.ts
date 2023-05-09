import { NgIf } from '@angular/common';
import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PeopleStateService } from './state/people.state';

@Component({
  standalone: true,
  selector: 'rx-swapi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PeopleStateService, MatSnackBar],
  imports: [MatButtonModule, MatProgressSpinnerModule, NgIf],
})
export class AppComponent implements OnInit {
  readonly #peopleState = inject(PeopleStateService);
  readonly #snackBar = inject(MatSnackBar);

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
}
function openSnackBar(value: any, value1: any) {
  throw new Error('Function not implemented.');
}
