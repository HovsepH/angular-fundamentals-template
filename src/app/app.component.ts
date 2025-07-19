import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  combineLatest,
  debounceTime,
  filter,
  forkJoin,
  map,
  Observable,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { MockDataService } from './mock-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  searchTermByCharacters = new Subject<string>();
  charactersResults$!: Observable<any>;
  planetAndCharactersResults$!: Observable<any>;
  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.initLoadingState();         // Task 5a
    this.initCharacterEvents();      // Task 1–3
  }

  // ✅ Task 1: Input Handler
  changeCharactersInput(event: any): void {
    const inputValue: string = event.target.value;
    this.searchTermByCharacters.next(inputValue);  // Push value to stream
  }

  // ✅ Tasks 2 & 3: Filter + Debounce + API
  initCharacterEvents(): void {
    this.charactersResults$ = this.searchTermByCharacters.pipe(
      filter(term => term.length >= 3),          // Don't call API if < 3 chars
      debounceTime(300),                         // Wait 300ms after user stops typing
      switchMap(term => this.mockDataService.getCharacters(term)) // Call API
    );
  }

  // ✅ Task 4: Combine API results into one array
  loadCharactersAndPlanet(): void {
    this.planetAndCharactersResults$ = forkJoin([
      this.mockDataService.getCharacters('luke'),  // You can replace with dynamic input if needed
      this.mockDataService.getPlanets()
    ]).pipe(
      map(([characters, planets]) => [...characters, ...planets])  // Merge arrays
    );
  }

  // ✅ Task 5a: Combine loading states into one
  initLoadingState(): void {
    const loading$ = combineLatest([
      this.mockDataService.getCharactersLoader(),
      this.mockDataService.getPlanetLoader()
    ]);

    const sub = loading$.subscribe(([charLoading, planetLoading]) => {
      this.isLoading = this.areAllValuesTrue([charLoading, planetLoading]);
    });

    this.subscriptions.push(sub);
  }

  // ✅ Task 5b: Unsubscribe properly
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ✅ Helper
  areAllValuesTrue(elements: boolean[]): boolean {
    return elements.every((el) => el);
  }
}
