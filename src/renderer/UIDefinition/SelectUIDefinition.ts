import DataPathElement from '../DataModel/DataPathElement';
import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPath from '../DataModel/DataPath';

export type SelectOption = { label: string, value: string | number };

interface SelectOptionFullDefinition {
  path: string;
}

interface DynamicOption {
  path: DataPath;
  labelPath?: DataPath;
  valuePath?: DataPath;
}

export interface SelectUIDefinitionConfigObject extends UIDefinitionConfigObject {
  emptyToNull: boolean;
  options: SelectOptionFullDefinition | Array<string | SelectOption>;
}

export default class SelectUIDefinition extends UIDefinitionBase {
  private _staticOptions?: Array<SelectOption>;
  private _dynamicOptions?: DynamicOption;

  private static parseStaticOptions(options: Array<string | SelectOption>): Array<SelectOption> {
    return options.map(option => {
      if (typeof option === 'string') {
        return { label: option, value: option };
      } else {
        return option as SelectOption;
      }
    });
  }

  public constructor(config: SelectUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
    if (Array.isArray(config.options)) {
      this._staticOptions = SelectUIDefinition.parseStaticOptions(config.options);
    } else if (config.options) {
      this._dynamicOptions = {
        path: DataPath.parse(config.options.path)
      };
    }
  }

  get dynamicOptions(): DynamicOption | undefined {
    return this._dynamicOptions;
  }
  get staticOptions(): Array<SelectOption> | undefined {
    return this._staticOptions;
  }
}