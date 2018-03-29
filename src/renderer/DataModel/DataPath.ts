import DataPathElement, { DataPathElementCompatible } from './DataPathElement';
import { List, Record } from 'immutable';

const DataPathRecord = Record({
  elements: List<DataPathElement>()
});

export type DataPathElementsCompatible = DataPathElementCompatible | Array<DataPathElementCompatible>;

export default class DataPath extends DataPathRecord {
  public readonly elements: List<DataPathElement>;

  public constructor(elements: DataPathElementsCompatible) {
    if (elements instanceof DataPathElement) {
      super({elements: List<DataPathElement>([elements])});
    } else if (Array.isArray(elements)) {
      super({elements: List<DataPathElement>(elements.map(path => {
        return DataPathElement.create(path);
      }))});
    } else {
      super({elements: List<DataPathElement>([DataPathElement.create(elements)])});
    }
  }

  public toString(): string {
    return this.elements.map(path => path!.toString()).join('.');
  }

  public set(key: string, value: any): this {
    return super.set(key, value) as this;
  }

  public unshift(path: DataPathElementCompatible): this {
    return this.set('elements', this.elements.unshift(DataPathElement.create(path)));
  }

  public shift(): this {
    return this.set('elements', this.elements.shift());
  }

  public pop(): this {
    return this.set('elements', this.elements.pop());
  }

  public push(element: DataPathElementCompatible): this {
    return this.set('elements', this.elements.push(DataPathElement.create(element)));
  }

  public concat(otherPath: DataPath): this {
    return this.set('elements', this.elements.concat(otherPath.elements));
  }
}