import DataModelBase, { CollectionDataModel, CollectionIndex } from "./DataModelBase";
import MapDataModel from "./MapDataModel";
import ListDataModel from "./ListDataModel";

export enum CollectionDataModelType {
  Map,
  List
}

export default class CollectionDataModelUtil {
  public static parseModelType(str: string): CollectionDataModelType {
    switch (str) {
      case 'list':
        return CollectionDataModelType.List;
      case 'map':
        return CollectionDataModelType.Map;
      default:
        throw new Error('Invalid collection data type');
    }
  }

  public static isCollectionDataModel(model: DataModelBase): model is CollectionDataModel {
    return model instanceof MapDataModel || model instanceof ListDataModel;
  }

  public static asCollectionDataModel(model?: DataModelBase): CollectionDataModel | undefined {
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
