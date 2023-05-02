import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PushPipe } from '@rx-angular/template/push';
import { PeopleStateService } from './state/people.state';

@Component({
  standalone: true,
  selector: 'rx-swapi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PeopleStateService],
  imports: [JsonPipe, PushPipe],
})
export class AppComponent implements OnInit {
  readonly #peopleState = inject(PeopleStateService);

  protected readonly people$ = this.#peopleState.people$;
  protected readonly selectedPerson$ = this.#peopleState.selectedPerson$;

  ngOnInit(): void {
    this.#peopleState.getPeople();
  }
}
