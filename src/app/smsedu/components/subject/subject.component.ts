/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { SubjectService } from '../../services/subject.service';
import { ISubject } from '../../domains/subject';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { paths } from 'src/app/helper/paths';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Table } from 'primeng/table';
import { TableExportService } from '../../services/table-export.service';

interface IProperty {
  value: string;
  label: string;
}

interface IParams {
  page: number;
  size: number;
  sort: string;
  sortOrder: string;
}

@Component({
  selector: 'app-subject',
  templateUrl: './subject.component.html',
})
export class SubjectComponent implements OnInit {
  subjects: ISubject[];
  exportedSubjects: ISubject[];
  loading = false;
  totalRecords = 0;
  params: IParams = { page: 1, size: 10, sort: '', sortOrder: '' };

  searchSubject = '';
  searchText$ = new Subject<string>();

  propertys!: IProperty[];

  constructor(
    private subjectService: SubjectService,
    private router: Router,
    private messageService: MessageService,
    private tableExportService: TableExportService
  ) {}

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(packageName =>
        this.getSubjects({ ...this.params, search: packageName })
      );

    this.propertys = [
      {
        value: 'technology&art',
        label: 'Nhóm môn Công nghệ và Kỹ thuật',
      },
      {
        value: 'social',
        label: 'Nhóm môn Xã hội',
      },
      {
        value: 'compulsory',
        label: 'Nhóm môn Tự nhiên',
      },
      {
        value: 'other',
        label: 'Khác',
      },
    ];
  }

  @ViewChild('dt', {}) tableEL: Table;

  clear() {
    this.tableEL.clear();
    this.searchSubject = '';
  }

  onLoadSubjects(event: any): void {
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
    this.getSubjects(this.params);
  }

  getSubjects(params?: object): void {
    this.loading = true;
    this.subjectService.getSubjects(params).subscribe(
      response => {
        this.subjects = response.data;
        this.totalRecords = response.itemCount;
        this.loading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Lấy danh sách lớp không thành công!',
        });
        this.router.navigate([paths.auth.error]);
      }
    );
  }

  getSearchValue(event: Event): string {
    this.searchSubject = (event.target as HTMLInputElement).value;
    return (event.target as HTMLInputElement).value;
  }

  onSearch(packageName: string) {
    this.searchText$.next(packageName);
  }

  onExportExcel(): void {
    this.subjectService.getSubjects().subscribe(
      response => {
        this.exportedSubjects = response.data;
        this.tableExportService.exportExcel(
          this.exportedSubjects.map((subject: ISubject) => {
            return {
              'Mã môn hoc': subject.id,
              'Môn học': subject.name,
              'Tên ký hiêu': subject.nickname,
              'Tổ hợp': this.getPropertyLabel(subject.property),
            };
          }),
          'classes'
        );
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: error?.message || 'Xóa Giáo viên không thành công!',
        });
      }
    );
  }

  getPropertyLabel(value: string): string {
    return this.propertys.find(item => item.value === value)?.label;
  }
}
