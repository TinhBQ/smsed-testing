import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DepartmentService } from '../../services/department.service';
import { TeacherService } from '../../services/teacher.service';
import { DepartmentRoutingModule } from './department-routing.module';
import { DepartmentComponent } from './department.component';
import { TableExportService } from '../../services/table-export.service';

@NgModule({
  declarations: [DepartmentComponent],
  imports: [
    CommonModule,
    DepartmentRoutingModule,
    TableModule,
    ToolbarModule,
    FileUploadModule,
    InputTextModule,
    AutoCompleteModule,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
  ],
  providers: [DepartmentService, TeacherService, TableExportService],
})
export class DepartmentModule {}
