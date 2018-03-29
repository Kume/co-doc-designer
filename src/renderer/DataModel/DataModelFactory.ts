import ScalarDataModel, { ScalarDataSource } from './ScalarDataModel';
import ListDataModel from './ListDataModel';
import MapDataModel from './MapDataModel';
import DataModelBase from './DataModelBase';

export default class DataModelFactory {
  public static createDataModel(source: any): DataModelBase {
    if (this.isScalerSourceType(source)) {
      return new ScalarDataModel(source);
    } else if (Array.isArray(source)) {
      return new ListDataModel(source);
    } else if (this.isDataModel(source)) {
      return source;
    } else if (typeof source === 'object') {
      return new MapDataModel(source);
    }
    throw new Error();
  }

  private static isScalerSourceType(source: any): source is ScalarDataSource {
    return typeof source === 'string' ||
      typeof source === 'number' ||
      typeof source === 'undefined' ||
      typeof source === 'boolean' ||
      source === null;
  }

  private static isDataModel(source: any): source is DataModelBase {
    return source instanceof ScalarDataModel ||
      source instanceof MapDataModel ||
      source instanceof ListDataModel;
  }
}
