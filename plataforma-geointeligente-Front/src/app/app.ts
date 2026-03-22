import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlarmsComponent } from './core/components/Alarms/alarms.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, AlarmsComponent]
})
export class App {
  protected readonly title = signal('frontend');
}
