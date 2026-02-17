import { Component, signal } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AirplaneIntroComponent } from './components/airplane-intro/airplane-intro.component';
import { ToastContainerComponent } from './shared';
import { routeAnimation } from './animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent, AirplaneIntroComponent],
  animations: [routeAnimation],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('portfolio');
  protected readonly showIntro = signal(true);

  constructor(private readonly contexts: ChildrenOutletContexts) {}

  getRouteAnimationData() {
    const ctx = this.contexts.getContext('primary');
    return ctx?.route?.snapshot?.url.toString() ?? '';
  }

  onIntroComplete(): void {
    this.showIntro.set(false);
  }
}
