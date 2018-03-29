import MultiContentsUIModel from './MultiContentsUIModel';
import DataPathElement from '../DataModel/DataPathElement';
import UIModelConfigObject from './UIModelConfigObject';
import ListDataModel from '../DataModel/ListDataModel';
import MapDataModel, { MapDataModelElement } from '../DataModel/MapDataModel';
import UIModelBase from './UIModelBase';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import { CollectionDataModelType, parseCollectionDataModelType } from '../DataModel/CollectionDataModelUtil';
import { CollectionDataModel } from '../DataModel/DataModelBase';

export interface TableUIModelConfigObject extends UIModelConfigObject {
  dataType?: string;
}

export default class TableUIModel extends MultiContentsUIModel {
  private _dataType: CollectionDataModelType = CollectionDataModelType.List;

  public constructor(config: TableUIModelConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
    if (config.dataType) {
      this._dataType = parseCollectionDataModelType(config.dataType);
    }
  }

  public get dataType(): CollectionDataModelType {
    return this._dataType;
  }

  public toTableData(data: CollectionDataModel): Array<any> {
    if (data instanceof ListDataModel) {
      return data.mapData(item => {
        const map = {};
        this.contents.forEach((content: UIModelBase) => {
          if (!(item instanceof MapDataModel)) {
            throw new Error('Invalid data type');
          }
          const key = content.key.getMapKey;
          const value = item.valueForKey(key) as ScalarDataModel;
          map[key] = value && value.value;
        });
        return map;
      });
    } else if (data instanceof MapDataModel) {
      return data.list.map((item: MapDataModelElement) => {
        const map = {};
        this.contents.forEach((content: UIModelBase) => {
          if (content.key.isKey) {
            map[DataPathElement.SpecialName.Key] = new ScalarDataModel(item.key.value);
          } else {
            const key = content.key.getMapKey;
            const itemValue = item.value;
            if (itemValue instanceof MapDataModel) {
              const value = itemValue.valueForKey(key) as ScalarDataModel;
              map[key] = value && value.value;
            } else {
              throw new Error('');
            }
          }
        });
        return map;
      }).toArray();
    }
    throw new Error('Invalid data type');
  }
}