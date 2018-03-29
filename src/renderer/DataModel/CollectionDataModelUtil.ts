import { CollectionIndex, default as DataModelBase } from './DataModelBase';
import DataPathElement from './DataPathElement';
import ScalarDataModel from './ScalarDataModel';

export enum CollectionDataModelType {
  Map,
  List
}

export function parseCollectionDataModelType(str: string): CollectionDataModelType {
  switch (str) {
    case 'list':
      return CollectionDataModelType.List;
    case 'map':
      return CollectionDataModelType.Map;
    default:
      throw new Error('Invalid collection data type');
  }
}

export function collectionIndexToKey(index: CollectionIndex): string | number {
  if (typeof index === 'number') {
    return index;
  } else {
    return index.value;
  }
}

export default class CollectionDataModelUtil {
  public static indexToPathElement(index: CollectionIndex): DataPathElement {
    if (typeof index === 'number') {
      return DataPathElement.create(index);
    } else {
      return DataPathElement.create(index.value);
    }
  }

  public static indexToDataModel(index: CollectionIndex): DataModelBase {
    if (typeof index === 'number') {
      return new ScalarDataModel(index);
    } else {
      return index;
    }
  }
}
