/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Directive,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SplashScreenService } from '../services/splash-screen.service';

@Directive({
  selector: '[appSplashScreen]',
})
export class SplashScreenDirective implements OnInit, OnChanges, OnDestroy {
  private subscription: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private splashScreenService: SplashScreenService,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', changes);
  }

  ngOnInit() {
    this.subscription = this.splashScreenService.isVisible$.subscribe(
      isVisible => {
        if (isVisible) {
          console.log('isVisible', isVisible);
          this.renderer.setStyle(document.body, 'overflow', 'hidden');
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.renderer.removeStyle(document.body, 'overflow');
          this.viewContainer.clear();
        }
      }
    );
  }

  ngOnDestroy() {
    // this.renderer.removeStyle(document.body, 'overflow');
    // this.viewContainer.clear();
    this.subscription.unsubscribe();
  }
}
