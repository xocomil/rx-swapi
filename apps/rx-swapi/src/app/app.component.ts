import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RxIf } from '@rx-angular/template/if';
import { PushPipe } from '@rx-angular/template/push';
import { PeopleStateService } from './state/people.state';

@Component({
  standalone: true,
  selector: 'rx-swapi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PeopleStateService],
  imports: [JsonPipe, PushPipe, RxIf],
})
export class AppComponent implements OnInit {
  readonly #peopleState = inject(PeopleStateService);

  protected readonly people$ = this.#peopleState.people$;
  protected readonly selectedPerson$ = this.#peopleState.selectedPerson$;
  protected readonly metaData$ = this.#peopleState.metaData$;
  protected readonly previous$ = this.#peopleState.previous$;
  protected readonly next$ = this.#peopleState.next$;
  protected readonly cachedData$ = this.#peopleState.cachedData$;

  ngOnInit(): void {
    this.#peopleState.getPeople();
  }

  protected navigateTo(url: string) {
    this.#peopleState.getPeople(url);
  }
}
