import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPath from '../DataModel/Path/DataPath';

export interface SelectOptionConfig {
  label: string;
  value: string | number;
}

interface SelectDynamicOptionConfig {
  path: string;
  labelPath?: string;
  valuePath?: string;
}

export interface SelectUIDefinitionConfigObject extends UIDefinitionConfigObject {
  emptyToNull: boolean;
  options: SelectDynamicOptionConfig | Array<string | SelectOptionConfig | SelectDynamicOptionConfig>;
  isMulti?: boolean;
}

export interface SelectDynamicOption {
  path: DataPath;
  labelPath?: DataPath;
  valuePath?: DataPath;
}

export interface SelectStaticOption {
  label: string;
  value: string | number;
}

function isDynamicOptionConfig(
  option: SelectOptionConfig | SelectDynamicOptionConfig
): option is SelectDynamicOptionConfig {
  return option.hasOwnProperty('path');
}

export function isDynamicOption(option: SelectStaticOption | SelectDynamicOption): option is SelectDynamicOption {
  return option.hasOwnProperty('path');
}

export default class SelectUIDefinition extends UIDefinitionBase {
  public readonly labelPath?: DataPath;
  public readonly isMulti: boolean;
  private _staticOptions: Array<SelectStaticOption> = [];
  private _dynamicOptions: SelectDynamicOption[] = [];
  private _options: Array<SelectStaticOption | SelectDynamicOption> = [];

  public constructor(config: SelectUIDefinitionConfigObject) {
    super(config.label, DataPathElement.parse(config.key));
    if (Array.isArray(config.options)) {
      for (const option of config.options) {
        if (typeof option === 'string') {
          this._options.push({ label: option, value: option });
        } else if (isDynamicOptionConfig(option)) {
          this._options.push({
            path: DataPath.parse(option.path),
            labelPath: option.labelPath ? DataPath.parse(option.labelPath) : undefined,
            valuePath: option.valuePath ? DataPath.parse(option.valuePath) : undefined,
          });
        } else {
          this._options.push(option);
        }
      }
    } else if (config.options) {
      this._options = [{
        path: DataPath.parse(config.options.path),
        labelPath: config.options.labelPath ? DataPath.parse(config.options.labelPath) : undefined,
        valuePath: config.options.valuePath ? DataPath.parse(config.options.valuePath) : undefined,
      }];
    }
    this.isMulti = !!config.isMulti;
  }

  get dynamicOptions(): SelectDynamicOption[] {
    return this._dynamicOptions;
  }
  get staticOptions(): SelectStaticOption[] {
    return this._staticOptions;
  }

  get options(): ReadonlyArray<SelectStaticOption | SelectDynamicOption> {
    return this._options;
  }
}