import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SignUp} from './auth/sign-up/sign-up';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SignUp],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AKELNY-Front');
}
