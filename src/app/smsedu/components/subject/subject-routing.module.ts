import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubjectComponent } from './subject.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: SubjectComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class SubjectRoutingModule {}
