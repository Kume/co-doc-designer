import DataPath from '../DataModel/DataPath';
import { Record } from 'immutable';
import { default as DataPathElement, DataPathElementCompatible } from '../DataModel/DataPathElement';
import { CollectionDataModel, CollectionIndex, default as DataModelBase } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';

const EditContextRecord = Record({
  path: new DataPath([])
});

export default class EditContext extends EditContextRecord {
  public static readonly empty = new EditContext();

  public readonly path: DataPath;

  public static currentIndexForData(
    editContext: EditContext | undefined,
    data?: CollectionDataModel,
    lastSelectedData?: DataModelBase
  ): CollectionIndex | undefined {
    if (!data || data.dataIsEmpty) { return undefined; }
    if (!editContext || editContext.path.elements.isEmpty()) {
      if (data instanceof MapDataModel) {
        return data.firstKey;
      } else if (data instanceof ListDataModel) {
        return data.indexForValue(lastSelectedData) || 0;
      }
      return undefined;
    }
    const first = editContext.path.elements.first();
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

  public static equals(a: EditContext | undefined, b: EditContext | undefined): boolean {
    if (a === undefined) {
      return b === undefined;
    } else {
      return !!b && a.equals(b);
    }
  }

  public get firstPathElement(): DataPathElement {
    return this.path.elements.first();
  }

  public get lastPathElement(): DataPathElement {
    return this.path.elements.last();
  }

  public get pathIsEmpty(): boolean {
    return this.path.elements.isEmpty();
  }

  public set(key: string, value: any): this {
    return super.set(key, value) as this;
  }

  public shift(): this {
    return this.set('path', this.path.shift());
  }

  public unshift(pathElement: DataPathElementCompatible): this {
    return this.set('path', this.path.unshift(pathElement));
  }

  public pop(): this {
    return this.set('path', this.path.pop());
  }

  public push(pathElement: DataPathElementCompatible): this {
    return this.set('path', this.path.push(pathElement));
  }
}