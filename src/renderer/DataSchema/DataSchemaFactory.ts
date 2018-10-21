import { DataSchemaConfig, DataSchemaType } from './DataSchema';
import { AnyDataSchema } from './index';

type SchemaConstructor = { new(config: DataSchemaConfig): AnyDataSchema };

export class DataSchemaFactory {
  private static schemas: Map<DataSchemaType, SchemaConstructor> = new Map();

  public static register(type: DataSchemaType, schemaConstructor: SchemaConstructor): void {
    DataSchemaFactory.schemas.set(type, schemaConstructor);
  }

  public static create(config: DataSchemaConfig): AnyDataSchema {
    const constructor = DataSchemaFactory.schemas.get(config.type)!;
    return new constructor(config);
  }
}
