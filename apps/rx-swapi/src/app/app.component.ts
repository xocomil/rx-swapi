import { NgIf } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PeopleStateService } from './state/people.state';

@Component({
  standalone: true,
  selector: 'rx-swapi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PeopleStateService],
  imports: [MatButtonModule, MatProgressSpinnerModule, NgIf],
})
export class AppComponent implements OnInit {
  readonly #peopleState = inject(PeopleStateService);

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

  ngOnInit(): void {
    this.#peopleState.getPeople();
  }

  protected navigateTo(url: string) {
    this.#peopleState.getPeople(url);
  }
}
