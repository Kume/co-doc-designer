import { StringDataSchema } from './StringDataSchema';
import NumberDataSchema from './NumberDataSchema';
import MapDataSchema from './MapDataSchema';
import BooleanDataSchema from './BooleanDataSchema';
import FixedMapDataSchema from './FixedMapDataSchema';

export * from './DataSchema';
export * from './DataSchemaFactory';
export * from './FixedMapDataSchema';
export * from './MapDataSchema';
export * from './NumberDataSchema';
export * from './BooleanDataSchema';
export * from './StringDataSchema';

export type AnyDataSchema =
  StringDataSchema |
  NumberDataSchema |
  BooleanDataSchema |
  MapDataSchema |
  FixedMapDataSchema;