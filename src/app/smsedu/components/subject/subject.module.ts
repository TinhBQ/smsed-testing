import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubjectComponent } from './subject.component';
import { SubjectRoutingModule } from './subject-routing.module';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { SubjectService } from '../../services/subject.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableExportService } from '../../services/table-export.service';

@NgModule({
  declarations: [SubjectComponent],
  imports: [
    CommonModule,
    SubjectRoutingModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
  ],
  providers: [SubjectService, TableExportService],
})
export class SubjectModule {}
