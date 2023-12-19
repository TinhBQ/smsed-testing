/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Table } from 'primeng/table';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  switchMap,
} from 'rxjs';
import { paths } from 'src/app/helper/paths';
import { convertStrToDate, fDate } from 'src/app/utils/format-time';
import * as XLSX from 'xlsx';
import { IClass } from '../../domains/class';
import { IDepartment } from '../../domains/department';
import { IStatus } from '../../domains/helper';
import { ISubject } from '../../domains/subject';
import { ITeacher } from '../../domains/teacher';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { DepartmentService } from '../../services/department.service';
import { SubjectService } from '../../services/subject.service';
import { TableExportService } from '../../services/table-export.service';
import { TeacherService } from '../../services/teacher.service';
import { ShowMassageService } from '../../services/show-massage.service';
import { ConfirmationService } from 'primeng/api';
import { SplashScreenService } from '../../services/splash-screen.service';

interface IParams {
  page: number;
  size: number;
  sort: string;
  sortOrder: string;
}

interface IQualification {
  label: string;
  value: string;
}

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
})
export class TeacherComponent implements OnInit {
  teachers!: ITeacher[];
  handleTeachers!: ITeacher[];
  teacher!: ITeacher;
  selectedTeachers!: ITeacher[];
  exportedTeachers!: ITeacher[];

  subjects!: ISubject[];
  filteredSubjects!: ISubject[];
  subject!: ISubject;

  departments!: IDepartment[];
  filteredDepartments!: IDepartment[];
  department!: IDepartment;

  classes!: IClass[];
  filteredClasses!: IClass[];
  class!: IClass;

  statuses: IStatus[];

  teacherDialog = false;

  loading = false;
  isSearch = false;
  isOpenView = false;
  isFirstLoadDialog = true;

  searchTeacher = '';
  searchText$ = new Subject<string>();

  totalRecords!: number;

  qualifications!: IQualification[];

  teacherForm: FormGroup = this.fb.group({
    id: [''],
    name: [
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern(/^[\p{Lu}][\p{L}']+([\s][\p{Lu}][\p{L}']+)*$/mu),
      ]),
    ],
    nickname: [
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern(/^[\p{L}()\s\d]*$/mu),
      ]),
    ],
    mainSubject: [{}, Validators.compose([Validators.required])],
    departmentNavigation: [{}, Validators.compose([Validators.required])],
    gender: [
      '',
      Validators.compose([Validators.required, Validators.pattern(/^(M|F)$/)]),
    ],
    isUnionMember: [false],
    isPartyMember: [false],
    phone: [
      '',
      Validators.compose([Validators.required, Validators.pattern(/^\d{10}$/)]),
    ],
    email: ['', Validators.compose([Validators.required, Validators.email])],
    address: ['', Validators.compose([Validators.required])],
    dateOfBirth: ['', Validators.compose([Validators.required])],
    qualification: ['', Validators.compose([Validators.required])],
    dateOfRecruitment: ['', Validators.compose([Validators.required])],
  });

  params: IParams = { page: 1, size: 10, sort: '', sortOrder: '' };

  minDate: Date | undefined;
  maxDate: Date | undefined;

  constructor(
    private teacherService: TeacherService,
    private fb: FormBuilder,
    private authService: AuthService,
    private subjectService: SubjectService,
    private router: Router,
    private departmentService: DepartmentService,
    private classService: ClassService,
    private tableExportService: TableExportService,
    private showMassageService: ShowMassageService,
    private confirmationService: ConfirmationService,
    private splashScreenService: SplashScreenService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(packageName =>
        this.getTeachers({ ...this.params, search: packageName })
      );

    this.statuses = [
      { label: 'Kích hoạt', value: 'activate' },
      { label: 'Không kích hoạt', value: 'inactivate' },
      { label: 'Đã xóa', value: 'deleted' },
    ];

    this.qualifications = [
      { label: 'Cao đẳng', value: 'associate' },
      { label: 'Đại học', value: 'bachelor' },
      { label: 'Thạc sĩ', value: 'master' },
      { label: 'Tiến sĩ', value: 'doctorate' },
    ];

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = prevMonth === 11 ? year - 99 : year - 100;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = nextMonth === 0 ? year - 19 : year - 20;
    this.minDate = new Date();
    this.minDate.setMonth(prevMonth);
    this.minDate.setFullYear(prevYear);
    this.maxDate = new Date();
    this.maxDate.setFullYear(nextYear);
  }

  @ViewChild('dt', {}) tableEL: Table;

  // * --------------------- Load Data Teachers for Table --------------------
  onLoadTeachers(event: any): void {
    this.loading = true;
    const { first, rows, sortField, sortOrder } = event;
    const _sortField = sortField ? sortField : this.params.sort;
    const _sortOrder = sortOrder ? sortOrder : 1;
    this.params = {
      page: first / rows + 1,
      size: rows,
      sort: _sortField,
      sortOrder: _sortOrder === 1 ? '' : 'desc',
    };
    this.getTeachers(this.params);
  }

  // * --------------------- Clear Table --------------------
  clear() {
    this.tableEL.clear(); // Clear the table
    this.searchTeacher = ''; // Reset search
  }

  // * --------------------- Refresh when there is a change --------------------
  onRefresh(): void {
    this.clear();
  }

  // * --------------------- Get List Teacher for Services --------------------
  getTeachers(params?: object): void {
    this.loading = true;
    this.teacherService.getTeachers(params).subscribe(
      response => {
        this.teachers = response.data;
        this.totalRecords = response.itemCount;
        this.loading = false;
      },
      error => {
        this.showMassageService.showErrorMessage(error?.message);
        this.router.navigate([paths.auth.error]);
      }
    );
  }

  // * --------------------- Handle Search --------------------
  getSearchValue(event: Event): string {
    this.searchTeacher = (event.target as HTMLInputElement).value;
    return (event.target as HTMLInputElement).value;
  }

  onSearch(packageName: string) {
    this.searchText$.next(packageName);
  }

  // * --------------------- Call APIs Serve for Edit Teacher --------------------
  onInitDataTeacherDialog(): Observable<any> {
    return Observable.create(observer => {
      this.splashScreenService.show();
      let isRefresh = false;
      forkJoin([
        this.subjectService.getSubjects(),
        this.departmentService.getDepartments(),
        this.classService.getClasses(),
      ])
        .pipe(
          catchError(error => {
            if (error === '401' && !isRefresh) {
              isRefresh = true;
              localStorage.setItem('isRefresh', isRefresh.toString());

              return this.authService.onRefreshToken().pipe(
                switchMap(response => {
                  const { accessToken, refreshToken } = response.data;
                  localStorage.setItem('accessToken', accessToken);
                  localStorage.setItem('refreshToken', refreshToken);
                  localStorage.setItem('isRefresh', 'false');
                  return this.onInitDataTeacherDialog();
                }),
                catchError(() => {
                  this.splashScreenService.hide();
                  this.showMassageService.showErrorMessage(
                    'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
                  );
                  this.router.navigate([paths.auth.login]);
                  localStorage.setItem('isRefresh', 'false');
                  return of('...');
                })
              );
            } else {
              this.splashScreenService.hide();
              this.router.navigate([paths.auth.error]);
              return of('...');
            }
          })
        )
        .subscribe(response => {
          this.subjects = response[0].data;
          this.departments = response[1].data;
          this.classes = response[2].data;
          this.splashScreenService.hide();
          observer.next(response);
          observer.complete();
        });
    });
  }

  // * --------------------- Call Api Get Teacher By Id Use To Edit Teacher --------------------
  onLoadDataTeacherDialog(id: string): void {
    this.teacherService.getTeacher(id).subscribe(
      response => {
        const {
          id,
          name,
          nickname,
          mainSubject,
          gender,
          isUnionMember,
          isPartyMember,
          phone,
          email,
          address,
          dateOfBirth,
          qualification,
          dateOfRecruitment,
          departmentNavigation,
        } = response.data;
        console.log('response.data', response.data);
        this.teacherForm.setValue({
          id,
          name,
          mainSubject,
          departmentNavigation,
          nickname,
          gender,
          isUnionMember,
          isPartyMember,
          phone,
          email,
          address,
          dateOfBirth: !dateOfBirth
            ? ''
            : convertStrToDate(dateOfBirth, 'yyyy-MM-dd'),
          qualification: this.qualifications.find(
            item => item.value === qualification
          ),
          dateOfRecruitment: !dateOfRecruitment
            ? ''
            : convertStrToDate(dateOfRecruitment, 'yyyy-MM-dd'),
        });
        this.teacherDialog = true;
      },
      error => {
        this.showMassageService.showErrorMessage(error?.message);
        this.teacherDialog = false;
      }
    );
  }

  // * --------------------- Handle Call Api When Open Dialog --------------------
  open(id: string): void {
    if (this.isFirstLoadDialog) {
      this.onInitDataTeacherDialog().subscribe(
        () => {
          this.onLoadDataTeacherDialog(id);
        },
        () => {
          //----
        },
        () => {
          if (this.isOpenView) {
            this.teacherForm.disable();
          } else {
            this.teacherForm.enable();
          }
        }
      );
      this.isFirstLoadDialog = false;
    } else {
      this.onLoadDataTeacherDialog(id);
      if (this.isOpenView) {
        this.teacherForm.disable();
      } else {
        this.teacherForm.enable();
      }
    }
  }

  // * --------------------- Open Detail View Teacher Dialog --------------------
  openDetail(id: string): void {
    this.isOpenView = true;
    this.open(id);
  }

  // * --------------------- Open Edit View Teacher Dialog --------------------
  openEdit(id: string) {
    this.isOpenView = false;
    this.open(id);
  }

  // * --------------------- Open New View Teacher Dialog --------------------
  openNew() {
    if (this.isFirstLoadDialog) {
      this.onInitDataTeacherDialog().subscribe(
        () => {
          // this.onInitTeacherForm();
        },
        err => console.log(err),
        () => {
          this.class = {};
          this.subject = {};
          this.department = {};
          this.teacher = {};
          this.isFirstLoadDialog = false;
          this.teacherDialog = true;
        }
      );
    } else {
      this.class = {};
      this.subject = {};
      this.department = {};
      this.teacher = {};
      this.onClearTeacherForm();
      this.teacherDialog = true;
    }
  }

  // * --------------------- Handle onSave Teacher Dialog --------------------
  onSaveTeacher(): void {
    this.handleTeachers = [];
    const {
      mainSubject,
      departmentNavigation,
      dateOfBirth,
      dateOfRecruitment,
      qualification,
      id,
      ...rest
    } = this.teacherForm.value;
    console.log('this.teacherForm.value', this.teacherForm.value);
    this.handleTeachers = [
      {
        id,
        ...rest,
        mainSubjectId: mainSubject?.id,
        departmentId: departmentNavigation?.id,
        dateOfBirth: fDate(dateOfBirth, 'yyyy-MM-dd'),
        dateOfRecruitment: fDate(dateOfRecruitment, 'yyyy-MM-dd'),
        qualification: qualification.value,
      },
    ];

    if (this.handleTeachers[0].id) {
      this.teacherService.updateTeacher(this.handleTeachers[0]).subscribe(
        response => {
          this.onRefresh();
          this.showMassageService.showSuccessMessage(response?.message);
        },
        error => {
          this.showMassageService.showErrorMessage(error?.message);
        }
      );
    } else {
      this.teacherService.addTeacher(this.handleTeachers).subscribe(
        response => {
          this.onRefresh();
          this.showMassageService.showSuccessMessage(response?.message);
        },
        error => {
          this.showMassageService.showErrorMessage(error?.message);
        }
      );
    }
    this.teacherDialog = false;
  }

  // * --------------------- Hide Teacher Dialog --------------------
  onHideDialog(): void {
    this.class = {};
    this.subject = {};
    this.department = {};
    this.teacher = {};
    this.teacherDialog = false;
    this.onClearTeacherForm();
  }

  // * --------------------- Clear Teacher Form Group --------------------
  onClearTeacherForm(): void {
    this.teacherForm.setValue({
      id: '',
      name: '',
      mainSubject: {},
      departmentNavigation: {},
      nickname: '',
      gender: '',
      isUnionMember: '',
      isPartyMember: '',
      phone: '',
      email: '',
      address: '',
      dateOfBirth: '',
      qualification: '',
      dateOfRecruitment: '',
    });
  }

  // * --------------------- Confirm Delete Teacher Form --------------------
  onConfirmDelete(teacher: ITeacher): void {
    this.confirmationService.confirm({
      key: 'confirm1',
      message: `Bạn chắc chắn muốn xóa Giáo viên <b>${teacher.name}</b>?`,
      accept: () => {
        this.teacherService.deleteTeacher([teacher.id]).subscribe(
          response => {
            this.onRefresh();
            this.showMassageService.showSuccessMessage(response?.message);
          },
          error => {
            this.showMassageService.showErrorMessage(error?.message);
          }
        );
      },
    });
  }

  onConfirmSelectedDelete(): void {
    this.confirmationService.confirm({
      key: 'confirm1',
      message: `Bạn chắc chắn muốn xóa danh sách Giáo viên?`,
      accept: () => {
        this.teacherService
          .deleteTeacher(this.selectedTeachers.map(teacher => teacher.id))
          .subscribe(
            response => {
              this.onRefresh();
              this.showMassageService.showSuccessMessage(response?.message);
            },
            error => {
              this.showMassageService.showErrorMessage(error?.message);
            }
          );
      },
    });
  }

  // * --------------------- Filter AutoComplete Subject --------------------
  onFilterSubject(event: AutoCompleteCompleteEvent) {
    const filtered: ISubject[] = [];
    const query = event.query;

    for (let i = 0; i < (this.subjects as ISubject[]).length; i++) {
      const subject = (this.subjects as ISubject[])[i];
      if (subject.name.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(subject);
      }
    }

    this.filteredSubjects = filtered;
  }

  // * --------------------- Filter AutoComplete Department --------------------
  onFilterDepartment(event: AutoCompleteCompleteEvent) {
    const filtered: IDepartment[] = [];
    const query = event.query;

    for (let i = 0; i < (this.departments as IDepartment[]).length; i++) {
      const department = (this.departments as IDepartment[])[i];
      if (department.name.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(department);
      }
    }

    this.filteredDepartments = filtered;
  }

  // * --------------------- Filter AutoComplete Class --------------------
  onFliterClass(event: AutoCompleteCompleteEvent) {
    const filtered: IClass[] = [];
    const query = event.query;

    for (let i = 0; i < (this.classes as IClass[]).length; i++) {
      const classs = (this.classes as IClass[])[i];
      if (classs.name.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(classs);
      }
    }

    this.filteredClasses = filtered;
  }

  onUploadTeachers(event: any) {
    console.log(
      '🚀 ~ file: teacher.component.ts:533 ~ TeacherComponent ~ onUploadTeachers ~ event:',
      event
    );
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = () => {
      import('xlsx').then(xlsx => {
        const workBook = xlsx.read(fileReader.result, { type: 'binary' });
        const sheetNames = workBook.SheetNames;
        console.log(
          'BQT',
          xlsx.utils.sheet_to_json(workBook.SheetNames[sheetNames[0]])
        );
      });
    };
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>evt.target;

    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;

      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];

      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const data = Object.values(XLSX.utils.sheet_to_json(ws, { header: 1 }));

      console.log('ws 1', XLSX.utils.sheet_to_json(ws, { header: 1 }));
      console.log('ws 2', XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1));

      console.log('result', this.convertToObj(data));
    };

    reader.readAsBinaryString(target.files[0]);
  }

  convertToObj = (arr: any[]): Record<string, any>[] => {
    const keys = arr[0];
    const result: Record<string, any>[] = [];

    for (let i = 1; i < arr.length; i++) {
      const obj: Record<string, any> = {};

      for (let j = 0; j < keys.length; j++) {
        obj[keys[j]] = arr[i][j];
      }

      result.push(obj);
    }

    return result;
  };

  onExportExcelTeachers(): void {
    this.teacherService.getTeachers().subscribe(
      response => {
        this.exportedTeachers = response.data;
        console.log('this.exportedTeachers', this.exportedTeachers);
        this.tableExportService.exportExcel(
          this.exportedTeachers.map((teacher: ITeacher) => {
            return {
              'Mã Giáo viên': teacher.id,
              'Họ và Tên': teacher.name,
              'Biệt danh': teacher.nickname,
              'Môn giảng dạy': teacher.mainSubject.name,
              'Phòng ban': teacher.departmentNavigation.name,
              'Giới tính': teacher.gender === 'M' ? 'Nữ' : 'Nam',
              'Đoàn viên': teacher.isUnionMember,
              'Đảng viên': teacher.isPartyMember,
              'Số điện thoại': teacher.phone,
              Email: teacher.email,
              'Ngày sinh': teacher.dateOfBirth,
              'Ngày tuyển dụng': teacher.dateOfRecruitment,
              'Địa chỉ': teacher.address,
              'Trình độ chuyên môn': this.qualifications.find(
                item => item.value === teacher.qualification
              ).label,
            };
          }),
          'teachers'
        );
      },
      error => {
        this.showMassageService.showErrorMessage(error?.message);
      }
    );
  }
}
