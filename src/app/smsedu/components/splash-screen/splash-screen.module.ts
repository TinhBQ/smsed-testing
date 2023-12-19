import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplashScreenComponent } from './splash-screen.component';
import { SplashScreenDirective } from '../../directives/splash-screen.directive';
import { SplashScreenService } from '../../services/splash-screen.service';

@NgModule({
  declarations: [SplashScreenComponent, SplashScreenDirective],
  imports: [CommonModule],
  providers: [SplashScreenService],
  exports: [SplashScreenComponent, SplashScreenDirective],
})
export class SplashScreenModule {}
