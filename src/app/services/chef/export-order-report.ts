import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { environment } from '../../../environments/environment';

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
    const url: string = `${environment.apiUrl}/OrderReports/export`
    this.http.post(url,
      {
        from: data.from,
        to: data.to
      }, { responseType: 'blob' })
      .subscribe((response: Blob) => {
        console.log(response)
        saveAs(response, "report.xlsx")
      })
  }

}


