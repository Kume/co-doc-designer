import { DataSchemaConfig, DataSchemaType } from './DataSchema';
import { AnyDataSchema } from './index';
import { DataContext } from '../DataModel/DataContext';
import { NamedItemManager } from '../DataModel/Storage/NamedItemManager';

type SchemaConstructor = {
  new(config: DataSchemaConfig,
      namedSchemaManager: NamedItemManager<DataSchemaConfig>,
      context: readonly DataContext[]): AnyDataSchema
};

export class DataSchemaFactory {
  private static schemas: Map<DataSchemaType, SchemaConstructor> = new Map();

  public static register(type: DataSchemaType, schemaConstructor: SchemaConstructor): void {
    DataSchemaFactory.schemas.set(type, schemaConstructor);
  }

  public static create(
    config: DataSchemaConfig,
    namedSchemaManager: NamedItemManager<DataSchemaConfig>,
    context: readonly DataContext[]
  ): AnyDataSchema {
    const constructor = DataSchemaFactory.schemas.get(config.type)!;
    return new constructor(config, namedSchemaManager, context);
  }
}
