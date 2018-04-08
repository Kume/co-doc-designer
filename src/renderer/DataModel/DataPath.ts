import DataPathElement, { DataPathElementCompatible } from './DataPathElement';
import { List, Record } from 'immutable';

const DataPathRecord = Record({
  elements: List<DataPathElement>(),
  isAbsolute: false,
  pointsKey: false
});

export type DataPathElementsCompatible = DataPathElementCompatible | Array<DataPathElementCompatible>;

export default class DataPath extends DataPathRecord {
  public readonly elements: List<DataPathElement>;
  public readonly isAbsolute: boolean;
  public readonly pointsKey: boolean;

  public static readonly empty: DataPath = new DataPath([]);

  public constructor(elements: DataPathElementsCompatible) {
    if (!(elements instanceof DataPathElement) && !Array.isArray(elements)) {
      elements = DataPathElement.create(elements);
    }

    if (elements instanceof DataPathElement) {
      if (elements.isKey) {
        super({
          elements: List<DataPathElement>([]),
          pointsKey: true
        });
      } else {
        super({
          elements: List<DataPathElement>([elements])
        });
      }
    } else if (Array.isArray(elements)) {
      const pathElements: Array<DataPathElement> = elements.map(path => {
        return DataPathElement.create(path);
      });
      if (pathElements.length > 0 && pathElements[pathElements.length - 1].isKey) {
        pathElements.pop();
        super({
          elements: List<DataPathElement>(pathElements),
          pointsKey: true
        });
      } else {
        super({elements: List<DataPathElement>(pathElements)})
      }
    }
  }

  public toString(): string {
    return this.elements.map(path => path!.toString()).join('.');
  }

  public set(key: string, value: any): this {
    return super.set(key, value) as this;
  }

  public unshift(path: DataPathElementCompatible): this {
    const pathElement = DataPathElement.create(path);
    if (pathElement.isKey) {
      if (this.elements.size > 0 || this.pointsKey) {
        throw new Error('Cannot unshift $key');
      }
      return this.set('pointsKey', true);
    } else {
      return this.set('elements', this.elements.unshift(pathElement));
    }
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