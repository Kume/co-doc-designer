import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfig, { UIDefinitionType } from './UIDefinitionConfig';
import { AnyDataSchema } from '../DataSchema';

interface UIDefinitionConstructor {
  new (config: UIDefinitionConfig, dataSchema?: AnyDataSchema): UIDefinitionBase;
}

export class UIDefinitionFactory {
  private static readonly constructors: Map<UIDefinitionType, UIDefinitionConstructor> = new Map();

  public static register(type: UIDefinitionType, definitionConstructor: UIDefinitionConstructor): void {
    UIDefinitionFactory.constructors.set(type, definitionConstructor);
  }

  public static create(config: UIDefinitionConfig, dataSchema?: AnyDataSchema): UIDefinitionBase {
    const definitionConstructor = UIDefinitionFactory.constructors.get(config.type)!;
    // console.log('UIDefinitionFactory.create', config.type, config, dataSchema);
    return new definitionConstructor(config, dataSchema);
  }
}