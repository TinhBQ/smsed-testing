import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ShowMassageService {
  constructor(private messageService: MessageService) {}

  showSuccessMessage(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: message,
    });
  }

  // Hàm để hiển thị thông báo lỗi
  showErrorMessage(error: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Thất bại',
      detail: error || 'Đã xảy ra lỗi',
    });
  }
}
