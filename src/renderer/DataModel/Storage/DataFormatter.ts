export interface DataFormatter {
  format(data: any): string;
  parse(source: string): any;
}