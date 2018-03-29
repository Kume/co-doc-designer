const isUnsignedIntegerRegexp = new RegExp('^[0-9]$');
export function isUnsignedIntegerString(str: string): boolean {
  return isUnsignedIntegerRegexp.test(str);
}