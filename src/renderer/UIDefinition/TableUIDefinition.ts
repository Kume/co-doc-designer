import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import CollectionDataModelUtil, {
  CollectionDataModelType,
  CollectionDataModelTypeString
} from '../DataModel/CollectionDataModelUtil';
import { CollectionDataModel } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';

export interface TableUIDefinitionConfigObject extends UIDefinitionConfigObject {
  dataType?: CollectionDataModelTypeString;
}

export default class TableUIDefinition extends MultiContentsUIDefinition {
  private _dataType: CollectionDataModelType = CollectionDataModelType.List;
  private _keyOrder?: string[];

  public constructor(config: TableUIDefinitionConfigObject) {
    super(config.label, DataPathElement.parse(config.key));
    if (config.dataType) {
      this._dataType = CollectionDataModelUtil.parseModelType(config.dataType);
    }
  }

  public get dataType(): CollectionDataModelType {
    return this._dataType;
  }

  public get keyOrder(): string[] {
    if (!this._keyOrder) {
      this._keyOrder = [];
      this.contents.forEach(content => {
        if (content!.key.canBeMapKey) {
          this._keyOrder!.push(content!.key.asMapKey);
        }
      });
    }
    return this._keyOrder;
  }

  public get defaultData(): CollectionDataModel {
    if (this.dataType === CollectionDataModelType.Map) {
      return MapDataModel.empty;
    } else {
      return ListDataModel.empty;
    }
  }
}