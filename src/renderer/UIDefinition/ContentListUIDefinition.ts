import SingleContentUIDefinition from './SingleContentUIDefinition';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/DataPathElement';
import { CollectionDataModel, CollectionIndex, default as DataModelBase } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import DataPath from "../DataModel/DataPath";
import UIDefinitionBase from "./UIDefinitionBase";
import { UIDefinitionFactory } from "./UIDefinitionFactory";
import DataModelFactory from "../DataModel/DataModelFactory";
import { ContentListIndex } from "../UIModel/ContentListUIModel";

export interface ContentListUIDefinitionConfigObject extends UIDefinitionConfigObject {
  listIndexKey?: string;
  addFormContent: UIDefinitionConfigObject;
  addFormDefaultValue: Object;
}

export default class ContentListUIDefinition extends SingleContentUIDefinition {
  private _listIndexKey?: DataPathElement;
  private _addFormContent: UIDefinitionBase;
  private _addFormDefaultValue: DataModelBase;
  public constructor(config: ContentListUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
    this._listIndexKey = DataPathElement.parse(config.listIndexKey!);
    this._addFormContent = UIDefinitionFactory.create(config.addFormContent);
    this._addFormDefaultValue = DataModelFactory.create(config.addFormDefaultValue);
  }

  get addFormContent(): UIDefinitionBase {
    return this._addFormContent;
  }

  get addFormDefaultValue(): DataModelBase {
    return this._addFormDefaultValue;
  }

  get listIndexKey(): DataPathElement | undefined {
    return this._listIndexKey;
  }

  public getIndexes(data: CollectionDataModel, selectedIndex?: CollectionIndex): Array<ContentListIndex> {
    return data.mapDataWithIndex<ContentListIndex>(
      (item: DataModelBase, index: CollectionIndex): ContentListIndex => {
        let isInvalid: boolean = false;
        const isSelected = index === selectedIndex;
        if (this._listIndexKey && this._listIndexKey.isKey) {
          return {index, title: index.toString(), isSelected, isInvalid};
        }
        let title: string = '';
        if (!(item instanceof MapDataModel)) {
          throw new Error('Invalid data type');
        }
        const scalarItem = item.getValue(new DataPath([this._listIndexKey!]));
        if (scalarItem instanceof ScalarDataModel) {
          title = scalarItem.value;
        } else {
          isInvalid = true;
        }
        return {index, title, isSelected, isInvalid};
      }
    );
  }
}