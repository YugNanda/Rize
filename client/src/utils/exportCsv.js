/**
 * Export array of data to CSV file and trigger download
 */
export function exportToCsv(filename = 'export.csv', rows = [], headers = []) {
  if (!rows || !rows.length) return false;

  const headerKeys = headers.length ? headers.map(h => h.key) : Object.keys(rows[0]);
  const headerLabels = headers.length ? headers.map(h => h.label) : headerKeys;

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [];
  // Add header row
  csvRows.push(headerLabels.map(escapeCsv).join(','));

  // Add data rows
  for (const row of rows) {
    const values = headerKeys.map(key => {
      let val = row;
      // Handle nested keys like 'studentId.userId.name'
      if (key.includes('.')) {
        const parts = key.split('.');
        for (const p of parts) {
          val = val ? val[p] : '';
        }
      } else {
        val = row[key];
      }
      return escapeCsv(val);
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
