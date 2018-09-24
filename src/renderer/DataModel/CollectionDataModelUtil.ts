import DataModelBase, { CollectionDataModel, CollectionIndex } from './DataModelBase';
import MapDataModel from './MapDataModel';
import ListDataModel from './ListDataModel';

export enum CollectionDataModelType {
  Map,
  List
}

export type CollectionDataModelTypeString = 'list' | 'map';

export default class CollectionDataModelUtil {
  public static parseModelType(
    str: CollectionDataModelTypeString | undefined,
    defaultType: CollectionDataModelType = CollectionDataModelType.Map
  ): CollectionDataModelType {
    switch (str) {
      case 'list':
        return CollectionDataModelType.List;
      case 'map':
        return CollectionDataModelType.Map;
      default:
        return defaultType;
    }
  }

  public static isCollectionDataModel(model: DataModelBase): model is CollectionDataModel {
    return model instanceof MapDataModel || model instanceof ListDataModel;
  }

  public static asCollectionDataModel(model: DataModelBase | undefined): CollectionDataModel | undefined {
    return model && this.isCollectionDataModel(model) ? model : undefined;
  }

  public static getValueForIndex(
    data: CollectionDataModel | undefined,
    index?: CollectionIndex | undefined
  ): DataModelBase | undefined {
    if (data instanceof MapDataModel) {
      if (typeof index === 'string') {
        return data.valueForKey(index);
      }
    } else if (data instanceof ListDataModel) {
      if (typeof index === 'number') {
        return data.getValueForIndex(index);
      }
    }
    return undefined;
  }
}
