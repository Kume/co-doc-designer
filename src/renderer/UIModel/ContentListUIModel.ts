import SingleContentUIModel from './SingleContentUIModel';
import UIModelConfigObject from './UIModelConfigObject';
import DataPathElement from '../DataModel/DataPathElement';
import { CollectionDataModel, CollectionIndex, default as DataModelBase } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import DataPath from "../DataModel/DataPath";
import CollectionDataModelUtil from "../DataModel/CollectionDataModelUtil";

export interface ContentListUIModelConfigObject extends UIModelConfigObject {
  listIndexKey?: string;
}

export interface ContentListIndex {
  index: CollectionIndex;
  isInvalid: boolean;
  isSelected: boolean;
  title: string;
  description?: string;
}

export default class ContentListUIModel extends SingleContentUIModel {
  private _listIndexKey?: DataPathElement;
  public constructor(config: ContentListUIModelConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
    this._listIndexKey = DataPathElement.parse(config.listIndexKey!);
  }

  public getIndexes(data: CollectionDataModel, selectedIndex?: CollectionIndex): Array<ContentListIndex> {
    return data.mapDataWithIndex<ContentListIndex>(
      (item: DataModelBase, index: CollectionIndex): ContentListIndex => {
        let isInvalid: boolean = false;
        const isSelected = CollectionDataModelUtil.indexesEqual(selectedIndex, index);
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