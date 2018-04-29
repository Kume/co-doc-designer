import ScalarDataModel, {
  BooleanDataModel, DateDataModel,
  FloatDataModel, IntegerDataModel, NullDataModel,
  StringDataModel
} from './ScalarDataModel';
import ListDataModel from './ListDataModel';
import MapDataModel from './MapDataModel';
import DataModelBase from './DataModelBase';

export default class DataModelFactory {
  public static create(source: any): DataModelBase {
    if (Array.isArray(source)) {
      return new ListDataModel(source);
    } else if (this.isDataModel(source)) {
      return source;
    }
    switch (typeof source) {
      case 'string':
        if (source === '') {
          return StringDataModel.empty;
        } else {
          return new StringDataModel(source);
        }
      case 'number':
        if (Number.isInteger(source)) {
          return new IntegerDataModel(source);
        } else {
          return new FloatDataModel(source);
        }
      case 'boolean':
        return new BooleanDataModel(source);
      case 'undefined':
        return NullDataModel.null;
      case 'object':
        if (source === null) {
          return NullDataModel.null;
        } else if (source instanceof Date) {
          return new DateDataModel(source);
        } else {
          return new MapDataModel(source);
        }
      default:
        throw new Error();
    }
  }

  public static isDataModel(source: any): source is DataModelBase {
    return source instanceof ScalarDataModel ||
      source instanceof MapDataModel ||
      source instanceof ListDataModel;
  }
}
