import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import CollectionDataModelUtil, {
  CollectionDataModelType,
  CollectionDataModelTypeString
} from '../DataModel/CollectionDataModelUtil';

export interface TableUIDefinitionConfigObject extends UIDefinitionConfigObject {
  dataType?: CollectionDataModelTypeString;
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
}