import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
})
export class Pagination {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalPages = 0;

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

  previous(): void {
    if (this.page > 1) {
      this.pageChange.emit({ page: this.page - 1, pageSize: this.pageSize });
    }
  }

  next(): void {
    if (this.page < this.totalPages) {
      this.pageChange.emit({ page: this.page + 1, pageSize: this.pageSize });
    }
  }
}
