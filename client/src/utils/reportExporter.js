/**
 * Client-Side Utility for Exporting Reports to CSV, Excel, and PDF
 */

/**
 * Export data array to CSV file
 */
export const exportToCSV = (title, headers, rows, filename) => {
  const csvRows = [];
  
  // Title / Meta header
  csvRows.push(`"${title}"`);
  csvRows.push(`"Generated On: ${new Date().toLocaleString()}"`);
  csvRows.push(''); // Blank line

  // Column Headers
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Data rows
  rows.forEach(row => {
    const formattedRow = row.map(val => {
      if (val === null || val === undefined) return '""';
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    });
    csvRows.push(formattedRow.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename || 'Attendance_Report'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data array to Excel (.xls) file with HTML Spreadsheet formatting
 */
export const exportToExcel = (title, metadata, headers, rows, filename) => {
  let excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Attendance Report</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: Arial, sans-serif; }
        .title { font-size: 16pt; font-weight: bold; color: #1E1B4B; }
        .meta { font-size: 10pt; color: #475569; }
        th { background-color: #4F46E5; color: #FFFFFF; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #312E81; }
        td { padding: 6px; border: 1px solid #CBD5E1; text-align: left; }
        .even { background-color: #F8FAFC; }
        .present { color: #16A34A; font-weight: bold; }
        .absent { color: #DC2626; font-weight: bold; }
        .eligible { color: #15803D; background-color: #DCFCE7; font-weight: bold; text-align: center; }
        .shortage { color: #B91C1C; background-color: #FEE2E2; font-weight: bold; text-align: center; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="${headers.length}" class="title">${title}</td></tr>
        <tr><td colspan="${headers.length}" class="meta">Generated: ${new Date().toLocaleString()}</td></tr>
  `;

  if (metadata && Object.keys(metadata).length > 0) {
    Object.entries(metadata).forEach(([key, val]) => {
      excelHtml += `<tr><td colspan="2"><b>${key}:</b></td><td colspan="${headers.length - 2}">${val}</td></tr>`;
    });
  }

  excelHtml += `<tr></tr><tr>`;
  headers.forEach(h => {
    excelHtml += `<th>${h}</th>`;
  });
  excelHtml += `</tr>`;

  rows.forEach((row, idx) => {
    const rowClass = idx % 2 === 0 ? 'even' : '';
    excelHtml += `<tr class="${rowClass}">`;
    row.forEach(val => {
      let cellStyle = '';
      const strVal = String(val);
      if (strVal === 'Eligible') cellStyle = 'class="eligible"';
      else if (strVal.includes('Shortage') || strVal.includes('Flagged')) cellStyle = 'class="shortage"';
      excelHtml += `<td ${cellStyle}>${val !== undefined && val !== null ? val : ''}</td>`;
    });
    excelHtml += `</tr>`;
  });

  excelHtml += `
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename || 'Attendance_Report'}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Print / Export document to PDF via high-resolution print window handler
 */
export const exportToPDF = (reportTitle, metadata, headers, rows, filename) => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Please allow popups to export PDF reports');
    return;
  }

  let metadataHtml = '';
  if (metadata && Object.keys(metadata).length > 0) {
    metadataHtml = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">';
    Object.entries(metadata).forEach(([k, v]) => {
      metadataHtml += `<div><span style="display:block; font-size:10px; color:#64748b; font-weight:bold; text-transform:uppercase;">${k}</span><span style="font-size:12px; font-weight:bold; color:#0f172a;">${v}</span></div>`;
    });
    metadataHtml += '</div>';
  }

  let tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:11px; margin-top:15px;">
    <thead>
      <tr style="background:#1e1b4b; color:white;">`;
  headers.forEach(h => {
    tableHtml += `<th style="padding:8px 10px; text-align:left; border:1px solid #312e81;">${h}</th>`;
  });
  tableHtml += `</tr></thead><tbody>`;

  rows.forEach((row, i) => {
    const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
    tableHtml += `<tr style="background:${bg};">`;
    row.forEach(val => {
      let extra = '';
      if (String(val) === 'Eligible') extra = 'color:#16a34a; font-weight:bold;';
      else if (String(val).includes('Shortage') || String(val).includes('Flagged')) extra = 'color:#dc2626; font-weight:bold;';
      tableHtml += `<td style="padding:6px 10px; border:1px solid #e2e8f0; ${extra}">${val}</td>`;
    });
    tableHtml += `</tr>`;
  });
  tableHtml += `</tbody></table>`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
          .university { font-size: 18px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
          .subtitle { font-size: 13px; font-weight: 600; color: #475569; margin-top: 2px; }
          .date { font-size: 10px; color: #94a3b8; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="university">UNIVERSITY ACADEMIC AFFAIRS</div>
            <div class="subtitle">${reportTitle}</div>
          </div>
          <div style="text-align:right;">
            <div class="date">Report Generated: ${new Date().toLocaleString()}</div>
            <div style="font-size:10px; color:#4f46e5; font-weight:bold; margin-top:4px;">VERIFIED OFFICIAL TRANSCRIPT</div>
          </div>
        </div>

        ${metadataHtml}
        ${tableHtml}

        <div class="footer">
          <div>
            <p>AttendPro Official Academic Management System Record.</p>
            <p>Computer generated report. Valid without manual seal.</p>
          </div>
          <div style="text-align:right;">
            <div style="width:180px; border-bottom:1px solid #475569; margin-bottom:4px; height:25px;"></div>
            <span>Academic Registrar Signature</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 750);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
