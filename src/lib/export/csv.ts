type CsvValue = string | number | null | undefined;

function csvCell(value: CsvValue): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: CsvValue[][]): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
