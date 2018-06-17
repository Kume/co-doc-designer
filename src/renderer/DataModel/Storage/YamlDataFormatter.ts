import { DataFormatter } from './DataFormatter';
import * as Yaml from 'js-yaml';

export default class YamlDataFormatter implements DataFormatter {
  format(data: any): string {
    return Yaml.safeDump(data);
  }

  parse(source: string): any {
    return Yaml.safeLoad(source);
  }
}