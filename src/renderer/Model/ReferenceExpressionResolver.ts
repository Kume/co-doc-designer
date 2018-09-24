import ReferenceExpression from './ReferenceExpression';
import { TemplateReference } from '../UIDefinition/TextUIDefinition';
import { CollectValue } from '../UIModel/types';
import DataPath from '../DataModel/Path/DataPath';
import DataModelBase, { DataCollectionElement } from '../DataModel/DataModelBase';
import { NumberDataModel, StringDataModel } from '../DataModel/ScalarDataModel';

interface HintForAutoComplete {
  text: string;
  displayText: string;
}

type DataWithPath = { data: DataModelBase, path: DataPath };

export default class ReferenceExpressionResolver {
  private readonly _expression: ReferenceExpression;
  private readonly _referenceDefinition: TemplateReference;
  private readonly _collectValue: CollectValue;

  public static resolve(
    refExp: ReferenceExpression,
    referenceDefinitions: ReadonlyArray<TemplateReference>,
    collectValue: CollectValue,
    dataPath: DataPath
  ): string | undefined {
    const definition = referenceDefinitions.find(def => def.key === refExp.category);
    if (!definition) { return; }
    const resolver = new ReferenceExpressionResolver(refExp, definition, collectValue);
    const resolved = resolver.resolve(dataPath);
    if (!resolved) { return; }
    const pathReference = definition.paths[definition.paths.length - 1][resolved.pathIndex];
    const collectionIndex = resolved.path.isNotEmptyPath()
      ? resolved.path.lastElement.asCollectionIndexOrUndefined()
      : undefined;
    return pathReference.description
      ? pathReference.description.fill(resolved.data, collectionIndex)
      : resolved.data.toString();
  }

  private static keyFromData(item: DataCollectionElement, keyPath: DataPath): string | undefined {
    if (keyPath.isEmptyPath && keyPath.pointsKey) {
      if (item.index === undefined || typeof item.index === 'string') {
        return item.index;
      } else {
        return item.index.toString();
      }
    } else {
      const keyData = item.data.getValue(keyPath);
      if (keyData instanceof StringDataModel) {
        return keyData.value;
      } else if (keyData instanceof NumberDataModel) {
        return keyData.value.toString();
      } else {
        return undefined;
      }
    }
  }

  constructor(
    expression: ReferenceExpression,
    referenceDefinition: TemplateReference,
    collectValue: CollectValue
  ) {
    this._expression = expression;
    this._referenceDefinition = referenceDefinition;
    this._collectValue = collectValue;
  }

  public get isLast(): boolean {
    const { parsed } = this._expression;
    if (!parsed) { return false; }
    if (parsed.keys) {
      return parsed.keys.text.length === this._referenceDefinition.paths.length;
    } else {
      return this._referenceDefinition.paths.length === 1;
    }
  }

  public fixedData(path: DataPath): DataWithPath | undefined {
    const { fixedKeys } = this._expression;
    const { paths } = this._referenceDefinition;
    if (fixedKeys.length === 0 || fixedKeys.length > paths.length) { return undefined; }

    let found: { data: DataModelBase, path: DataPath } | undefined;
    for (let i = 0; i < fixedKeys.length; i++) {
      for (const j of paths[i]) {
        found = this._collectValue(j.path, path)
          .find(item => ReferenceExpressionResolver.keyFromData(item, j.keyPath) === fixedKeys[i]);
        if (found) { break; }
      }
      if (!found) { return undefined; }
      path = found.path;
    }
    return found;
  }

  public hints(path: DataPath): HintForAutoComplete[] {
    if (this._expression.currentType !== 'keys') { return []; }
    const fixedData = this.fixedData(path);
    const { fixedKeys, currentKey } = this._expression;
    const currentPaths = this._referenceDefinition.paths[fixedKeys.length];
    if (!currentPaths) { return []; }

    const hints: HintForAutoComplete[] = [];
    const addedKeys = new Set<string>();
    for (const currentPath of currentPaths) {
      const collected = fixedData
        ? this._collectValue(currentPath.path, fixedData.path, {basePathData: fixedData.data})
        : this._collectValue(currentPath.path, path);
      collected.forEach(item => {
        const lastMark = this.isLast ? '}}' : '.';
        const key = ReferenceExpressionResolver.keyFromData(item, currentPath.keyPath);
        if (!key || addedKeys.has(key)) { return; }
        addedKeys.add(key);
        if (currentKey && !key.startsWith(currentKey)) { return; }

        hints.push({
          text: `${this._expression.category}:${fixedKeys.map(key => key + '.').join('')}${key}${lastMark}`,
          displayText: currentPath.description ? currentPath.description.fill(item.data, item.index) : ''
        });
      });
    }
    return hints;
  }

  public resolve(path: DataPath): { data: DataModelBase, path: DataPath, pathIndex: number } | undefined {
    const { keys } = this._expression;
    const { paths } = this._referenceDefinition;
    if (keys.length !== paths.length) { return undefined; }

    let found: { data: DataModelBase, path: DataPath, pathIndex: number } | undefined;
    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < paths[i].length; j++) {
        const _found = this._collectValue(paths[i][j].path, path)
          .find(item => ReferenceExpressionResolver.keyFromData(item, paths[i][j].keyPath) === keys[i]);
        if (_found) {
          found = {data: _found.data, path: _found.path, pathIndex: j};
          break;
        }
      }
      if (!found) { return undefined; }
      path = found.path;
    }
    return found;
  }
}