import { JsonPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PeopleStateService } from './state/people.state';

@Component({
  standalone: true,
  selector: 'rx-swapi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PeopleStateService],
  imports: [JsonPipe, NgIf],
})
export class AppComponent implements OnInit {
  readonly #peopleState = inject(PeopleStateService);

  protected readonly people = toSignal(this.#peopleState.people$, {
    initialValue: [],
  });
  protected readonly selectedPerson$ = this.#peopleState.selectedPerson$;
  protected readonly previous = toSignal(this.#peopleState.previous$);
  protected readonly next = toSignal(this.#peopleState.next$);

  ngOnInit(): void {
    this.#peopleState.getPeople();
  }

  protected navigateTo(url: string) {
    this.#peopleState.getPeople(url);
  }
}
