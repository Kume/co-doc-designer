import DataPathElement, { DataPathElementCompatible } from './DataPathElement';
import { List, Record } from 'immutable';
import * as PathParser from './PathParser';
import InvalidCallError from '../../../common/Error/InvalidCallError';

const DataPathRecord = Record({
  elements: List<DataPathElement>(),
  isAbsolute: false,
  pointsKey: false
});

interface ParsedPathElement {
  type: string;
  words?: Array<string>;
  path?: ParsedPath;
}

interface DataPathOption {
  isAbsolute?: boolean;
  pointsKey?: boolean;
}

type ParsedPath = Array<ParsedPathElement | string>;

export type DataPathElementsCompatible = DataPathElementCompatible | Array<DataPathElementCompatible>;

export default class DataPath extends DataPathRecord {
  public static readonly empty: DataPath = new DataPath([]);
  public static readonly absoluteEmpty: DataPath = new DataPath([], {isAbsolute: true});

  public readonly elements: List<DataPathElement>;
  public readonly isAbsolute: boolean;
  public readonly pointsKey: boolean;

  public static parse(value: string): DataPath {
    if (value === DataPathElement.SpecialName.Key) {
      return new DataPath(DataPathElement.key);
    }
    const parsed = PathParser.parse(value) as ParsedPath;
    return this._parse(parsed);
  }

  public static join(head: DataPath, tail: DataPath) {
    if (!head.isAbsolute || head.pointsKey || tail.isAbsolute) {
      throw new Error('Invalid path join');
    }

    const { reverseCount } = tail;
    const headElements = head.elements.splice(head.elements.size - reverseCount, reverseCount);
    const tailElements = tail.elements.splice(0, reverseCount);

    return head
      .set('elements', headElements.concat(tailElements))
      .set('pointsKey', tail.pointsKey);
  }

  private static _parse(parsed: ParsedPath): DataPath {
    parsed = [...parsed];
    const option: DataPathOption = {};
    if (parsed.length > 0) {
      const first = parsed[0];
      if (typeof first === 'object' && first.type === 'absolute') {
        option.isAbsolute = true;
        parsed.shift();
      }
    }
    if (parsed.length > 0) {
      const last = parsed[parsed.length - 1];
      if (typeof last === 'object' && last.type === 'key') {
        option.pointsKey = true;
        parsed.pop();
      }
    }
    const elements = parsed.map(parsedElement => {
      if (typeof parsedElement === 'string') {
        return DataPathElement.parse(parsedElement);
      } else if (parsedElement.type === 'wildcard') {
        return DataPathElement.wildCard;
      } else if (parsedElement.type === 'variable') {
        return DataPathElement.variable(this._parse(parsedElement.path!));
      } else if (parsedElement.type === 'parent') {
        return DataPathElement.reverse;
      } else {
        throw new Error();
      }
    });
    return new DataPath(elements, option);
  }

  public constructor(elements: DataPathElementsCompatible, options: DataPathOption = {}) {
    if (!(elements instanceof DataPathElement) && !Array.isArray(elements)) {
      elements = DataPathElement.create(elements);
    }

    if (elements instanceof DataPathElement) {
      if (elements.isKey) {
        super({
          elements: List<DataPathElement>([]),
          pointsKey: true,
          ...options
        });
      } else {
        super({
          elements: List<DataPathElement>([elements]),
          ...options
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
          pointsKey: true,
          ...options
        });
      } else {
        super({elements: List<DataPathElement>(pathElements), ...options});
      }
    }
  }

  public toString(): string {
    return this.elements.map(path => path!.toString()).join('.');
  }

  public set(key: string, value: any): this {
    return super.set(key, value) as this;
  }

  public get firstElement(): DataPathElement {
    return this.elements.first();
  }

  public get lastElement(): DataPathElement {
    return this.elements.last();
  }

  public get isSingleElement(): boolean {
    return this.elements.size === 1;
  }

  public get isEmptyPath(): boolean {
    return this.elements.isEmpty();
  }

  public get reverseCount(): number {
    let count = 0;
    this.elements.forEach(element => {
      if (element!.isReverse) { count++; }
    });
    return count;
  }

  public unshift(path: DataPathElementCompatible): this {
    const pathElement = DataPathElement.create(path);
    if (pathElement.isKey) {
      if (this.elements.size > 0 || this.pointsKey) {
        throw new InvalidCallError('Cannot unshift $key');
      }
      return this.set('pointsKey', true);
    } else {
      return this.set('elements', this.elements.unshift(pathElement)).set('isAbsolute', false);
    }
  }

  public shift(): this {
    return this.set('elements', this.elements.shift()).set('isAbsolute', false);
  }

  public pop(): this {
    return this.set('elements', this.elements.pop());
  }

  public push(element: DataPathElementCompatible): this {
    if (!(element instanceof DataPathElement)) {
      element = DataPathElement.create(element);
    }
    if (element.isKey) {
      if (this.pointsKey) {
        throw new Error('Cannot push $key');
      }
      return this.set('pointsKey', true);
    } else {
      return this.set('elements', this.elements.push(element));
    }
  }

  public concat(otherPath: DataPath): this {
    return this.set('elements', this.elements.concat(otherPath.elements));
  }
}