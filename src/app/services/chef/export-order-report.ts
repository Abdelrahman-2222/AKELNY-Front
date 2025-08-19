import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';

interface IExportOrderReport {
  from: string,
  to: string
}
@Injectable({
  providedIn: 'root'
})
export class ExportOrderReport {
  http = inject(HttpClient)

  public downloadExcel(data: IExportOrderReport): void {
    const url: string = 'https://localhost:7045/api/OrderReports/export'
    this.http.post(url,
      {
        from: data.from,
        to: data.to
      }, { responseType: 'blob' })
      .subscribe((response: Blob) => saveAs(response, "report.xlsx"))
  }

}


