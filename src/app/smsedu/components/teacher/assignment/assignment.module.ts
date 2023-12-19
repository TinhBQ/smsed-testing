import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { AssignmentService } from '../../../services/assignment.service';
import { AssignmentRoutingModule } from './assignment-routing.module';
import { AssignmentComponent } from './assignment.component';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TeacherService } from '../../../services/teacher.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ClassService } from '../../../services/class.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { AuthService } from '../../../services/auth.service';
import { SubjectService } from '../../../services/subject.service';

@NgModule({
  declarations: [AssignmentComponent],
  imports: [
    CommonModule,
    AssignmentRoutingModule,
    TableModule,
    ToolbarModule,
    FileUploadModule,
    FormsModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    AutoCompleteModule,
    InputNumberModule,
    InputMaskModule,
  ],
  providers: [
    AssignmentService,
    TeacherService,
    ClassService,
    AuthService,
    SubjectService,
  ],
  exports: [AssignmentComponent],
})
export class AssignmentModule {}
