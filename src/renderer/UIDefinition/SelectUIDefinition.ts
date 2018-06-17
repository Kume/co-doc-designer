import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPath from '../DataModel/Path/DataPath';

export interface SelectOption {
  label: string,
  value: string | number
}

interface SelectOptionFullDefinition {
  path: string;
  labelPath?: string;
  valuePath?: string;
}

export interface SelectUIDynamicOptions {
  path: DataPath;
  labelPath?: DataPath;
  valuePath?: DataPath;
}

export interface SelectUIDefinitionConfigObject extends UIDefinitionConfigObject {
  emptyToNull: boolean;
  options: SelectOptionFullDefinition | Array<string | SelectOption>;
}

export default class SelectUIDefinition extends UIDefinitionBase {
  public readonly labelPath?: DataPath;
  private _staticOptions?: Array<SelectOption>;
  private _dynamicOptions?: SelectUIDynamicOptions;

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
        path: DataPath.parse(config.options.path),
        labelPath: config.options.labelPath ? DataPath.parse(config.options.labelPath) : undefined,
        valuePath: config.options.valuePath ? DataPath.parse(config.options.valuePath) : undefined,
      };
    }
  }

  get dynamicOptions(): SelectUIDynamicOptions | undefined {
    return this._dynamicOptions;
  }
  get staticOptions(): Array<SelectOption> | undefined {
    return this._staticOptions;
  }
}