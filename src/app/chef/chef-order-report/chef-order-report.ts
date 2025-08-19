import { Component, inject } from '@angular/core';
import { ExportOrderReport } from '../../services/chef/export-order-report';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chef-order-report',
  imports: [FormsModule,NgIf],
  templateUrl: './chef-order-report.html',
  styleUrl: './chef-order-report.css'
})
export class ChefOrderReport {
  report = inject(ExportOrderReport)

  isPopupOpen = false;
  fromDate = '';
  toDate = '';

  openPopup(): void {
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
  }

  ExportReport() {
    this.report.downloadExcel({
      from: this.fromDate,
      to: this.toDate
    })
     this.closePopup();
  }
}

