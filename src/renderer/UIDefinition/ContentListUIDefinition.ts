import SingleContentUIDefinition from './SingleContentUIDefinition';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/Path/DataPathElement';
import DataModelBase, { CollectionDataModel } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import UIDefinitionBase from './UIDefinitionBase';
import { UIDefinitionFactory } from './UIDefinitionFactory';
import DataModelFactory from '../DataModel/DataModelFactory';
import ListDataModel from '../DataModel/ListDataModel';
import {
  CollectionDataModelType,
  CollectionDataModelTypeString,
  default as CollectionDataModelUtil
} from '../DataModel/CollectionDataModelUtil';

export interface ContentListUIDefinitionConfigObject extends UIDefinitionConfigObject {
  listIndexKey?: string;
  addFormContent: UIDefinitionConfigObject;
  addFormDefaultValue: Object;
  dataType?: CollectionDataModelTypeString;
}

export default class ContentListUIDefinition extends SingleContentUIDefinition {
  private _listIndexKey?: DataPathElement;
  private _addFormContent?: UIDefinitionBase;
  private _addFormDefaultValue: DataModelBase;
  private _dataType: CollectionDataModelType;

  public constructor(config: ContentListUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
    this._listIndexKey = config.listIndexKey === undefined ? undefined : DataPathElement.parse(config.listIndexKey);
    if (config.addFormContent) {
      this._addFormContent = UIDefinitionFactory.create(config.addFormContent);
    }
    this._addFormDefaultValue = DataModelFactory.create(config.addFormDefaultValue);
    this._dataType = CollectionDataModelUtil.parseModelType(config.dataType);
  }

  get addFormContent(): UIDefinitionBase | undefined {
    return this._addFormContent;
  }

  get addFormDefaultValue(): DataModelBase {
    return this._addFormDefaultValue;
  }

  get listIndexKey(): DataPathElement | undefined {
    return this._listIndexKey;
  }

  get dataType(): CollectionDataModelType {
    return this._dataType;
  }

  get defaultCollection(): CollectionDataModel {
    if (this._dataType === CollectionDataModelType.List) {
      return new ListDataModel([]);
    } else {
      return new MapDataModel({});
    }
  }
}