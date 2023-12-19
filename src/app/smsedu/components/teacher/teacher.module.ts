import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { DepartmentService } from '../../services/department.service';
import { SubjectService } from '../../services/subject.service';
import { TableExportService } from '../../services/table-export.service';
import { TeacherService } from '../../services/teacher.service';
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { ShowMassageService } from '../../services/show-massage.service';
@NgModule({
  declarations: [TeacherComponent],
  imports: [
    CommonModule,
    TeacherRoutingModule,
    ToolbarModule,
    FileUploadModule,
    TableModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    AutoCompleteModule,
    InputNumberModule,
    InputMaskModule,
    ReactiveFormsModule,
    RadioButtonModule,
    CheckboxModule,
    CalendarModule,
  ],
  providers: [
    TeacherService,
    ClassService,
    AuthService,
    SubjectService,
    DepartmentService,
    TableExportService,
    ShowMassageService,
  ],
  exports: [TeacherComponent],
})
export class TeacherModule {}
