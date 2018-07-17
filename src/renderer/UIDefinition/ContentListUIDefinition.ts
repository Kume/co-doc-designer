import SingleContentUIDefinition from './SingleContentUIDefinition';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/Path/DataPathElement';
import { CollectionDataModel } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';
import {
  CollectionDataModelType,
  CollectionDataModelTypeString,
  default as CollectionDataModelUtil
} from '../DataModel/CollectionDataModelUtil';

export interface ContentListUIDefinitionConfigObject extends UIDefinitionConfigObject {
  listIndexKey?: string;
  dataType?: CollectionDataModelTypeString;
}

export default class ContentListUIDefinition extends SingleContentUIDefinition {
  private _listIndexKey?: DataPathElement;
  private _dataType: CollectionDataModelType;

  public constructor(config: ContentListUIDefinitionConfigObject) {
    super(config.label, DataPathElement.parse(config.key));
    this._listIndexKey = config.listIndexKey === undefined ? undefined : DataPathElement.parse(config.listIndexKey);
    this._dataType = CollectionDataModelUtil.parseModelType(config.dataType);
  }

  get listIndexKey(): DataPathElement | undefined {
    return this._listIndexKey;
  }

  get dataType(): CollectionDataModelType {
    return this._dataType;
  }

  get defaultData(): CollectionDataModel {
    if (this._dataType === CollectionDataModelType.List) {
      return new ListDataModel([]);
    } else {
      return new MapDataModel({});
    }
  }
}