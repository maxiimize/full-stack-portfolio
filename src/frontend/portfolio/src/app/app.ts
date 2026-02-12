import { Component, signal } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastContainerComponent } from './shared';
import { routeAnimation } from './animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent],
  animations: [routeAnimation],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('portfolio');

  constructor(private readonly contexts: ChildrenOutletContexts) {}

  getRouteAnimationData() {
    const ctx = this.contexts.getContext('primary');
    return ctx?.route?.snapshot?.url.toString() ?? '';
  }
}
