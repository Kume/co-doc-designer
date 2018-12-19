import DataPath from '../DataModel/Path/DataPath';
import {
  SelectDynamicOptionConfig,
  SelectOptionConfig,
  SelectStaticOptionConfig
} from '../UIDefinition/UIDefinitionConfig';

export interface SelectOption<T = number | string> {
  label: string;
  value: T;
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
export function isDynamicOptionConfig<T = number | string>(
  option: string | SelectStaticOptionConfig<T> | SelectDynamicOptionConfig
): option is SelectDynamicOptionConfig {
  return option.hasOwnProperty('path');
}

export function isDynamicOption(option: SelectStaticOption | SelectDynamicOption): option is SelectDynamicOption {
  return option.hasOwnProperty('path');
}

export function parseOptionsConfig(config: SelectOptionConfig): Array<SelectStaticOption | SelectDynamicOption> {
  if (Array.isArray(config)) {
    const options: Array<SelectStaticOption | SelectDynamicOption> = [];
    for (const option of config) {
      if (typeof option === 'string') {
        options.push({ label: option, value: option });
      } else if (isDynamicOptionConfig(option)) {
        options.push({
          path: DataPath.parse(option.path),
          labelPath: option.labelPath ? DataPath.parse(option.labelPath) : undefined,
          valuePath: option.valuePath ? DataPath.parse(option.valuePath) : undefined,
        });
      } else {
        options.push(option);
      }
    }
    return options;
  } else {
    return [{
      path: DataPath.parse(config.path),
      labelPath: config.labelPath ? DataPath.parse(config.labelPath) : undefined,
      valuePath: config.valuePath ? DataPath.parse(config.valuePath) : undefined,
    }];
  }
}