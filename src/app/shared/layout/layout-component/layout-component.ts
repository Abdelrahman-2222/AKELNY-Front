import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from '../../components/navbar/navbar-component/navbar-component';
import { Footer } from '../../components/footer/footer';
import { Chat } from '../../components/chat/chat';

@Component({
  selector: 'app-layout-component',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, Footer, Chat],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-chat></app-chat>
  `
})
export class LayoutComponent {}
