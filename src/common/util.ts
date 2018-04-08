const isUnsignedIntegerRegexp = new RegExp('^[0-9]$');
export function isUnsignedIntegerString(str: string): boolean {
  return isUnsignedIntegerRegexp.test(str);
}

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}
