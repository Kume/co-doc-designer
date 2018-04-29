import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import DataPathElement from '../DataModel/DataPathElement';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import ListDataModel from '../DataModel/ListDataModel';
import MapDataModel from '../DataModel/MapDataModel';
import UIDefinitionBase from './UIDefinitionBase';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import { CollectionDataModel } from '../DataModel/DataModelBase';
import CollectionDataModelUtil, { CollectionDataModelType } from '../DataModel/CollectionDataModelUtil';
import DataModelFactory from '../DataModel/DataModelFactory';

export interface TableUIDefinitionConfigObject extends UIDefinitionConfigObject {
  dataType?: string;
}

export default class TableUIDefinition extends MultiContentsUIDefinition {
  private _dataType: CollectionDataModelType = CollectionDataModelType.List;

  public constructor(config: TableUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
    if (config.dataType) {
      this._dataType = CollectionDataModelUtil.parseModelType(config.dataType);
    }
  }

  public get dataType(): CollectionDataModelType {
    return this._dataType;
  }

  public toTableData(data: CollectionDataModel): Array<any> {
    if (data instanceof ListDataModel) {
      return data.mapData(item => {
        const map = {};
        this.contents.forEach((content: UIDefinitionBase) => {
          if (!(item instanceof MapDataModel)) {
            throw new Error('Invalid data type');
          }
          const key = content.key.asMapKey;
          const value = item.valueForKey(key) as ScalarDataModel;
          map[key] = value && value.value;
        });
        return map;
      });
    } else if (data instanceof MapDataModel) {
      return data.mapDataWithIndex((item, index) => {
        const map = {};
        this.contents.forEach((content: UIDefinitionBase) => {
          if (content.key.isKey) {
            map[DataPathElement.SpecialName.Key] = DataModelFactory.create(index);
          } else {
            const key = content.key.asMapKey;
            if (item instanceof MapDataModel) {
              const value = item.valueForKey(key) as ScalarDataModel;
              map[key] = value && value.value;
            } else {
              throw new Error('');
            }
          }
        });
        return map;
      });
    } else {
      // TODO 警告
      return [];
    }
  }
}