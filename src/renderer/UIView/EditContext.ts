import DataPath from '../DataModel/DataPath';
import { Record } from 'immutable';
import DataPathElement from '../DataModel/DataPathElement';
import { CollectionDataModel, CollectionIndex } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';

const EditContextRecord = Record({
  path: new DataPath([])
});

export default class EditContext extends EditContextRecord {
  public readonly path: DataPath;

  public set(key: string, value: any): this {
    return super.set(key, value) as this;
  }

  public shift(): this {
    return this.set('path', this.path.shift());
  }

  public unshift(pathElement: string): this;
  public unshift(pathElement: number): this;
  public unshift(pathElement: DataPathElement): this;
  public unshift(pathElement: any): this {
    return this.set('path', this.path.unshift(pathElement));
  }

  public currentIndexForData(data: CollectionDataModel): CollectionIndex | undefined {
    if (data.dataIsEmpty) { return undefined; }
    if (this.path.elements.isEmpty()) {
      if (data instanceof MapDataModel) {
        return data.firstKey;
      } else if (data instanceof ListDataModel) {
        return 0;
      }
      return undefined;
    }
    const first = this.path.elements.first();
    if (data instanceof MapDataModel) {
      if (first.canBeMapKey) {
        const key = first.asMapKey;
        return data.isValidKey(key) ? key : undefined;
      } else {
        return undefined;
      }
    } else if (data instanceof ListDataModel) {
      if (first.canBeListIndex) {
        const index = first.asListIndex;
        return data.isValidIndex(index) ? index : undefined;
      } else {
        return undefined;
      }
    } else {
      throw new Error('Invalid type');
    }
  }
}
