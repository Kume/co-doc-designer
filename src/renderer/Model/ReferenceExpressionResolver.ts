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

export default class ReferenceExpressionResolver {
  private readonly _expression: ReferenceExpression;
  private readonly _referenceDefinition: TemplateReference;
  private readonly _collectValue: CollectValue;

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

  public fixedData(path: DataPath): { data: DataModelBase, path: DataPath } | undefined {
    const { fixedKeys } = this._expression;
    const { paths } = this._referenceDefinition;
    if (fixedKeys.length === 0 || fixedKeys.length > paths.length) { return undefined; }

    let found: { data: DataModelBase, path: DataPath } | undefined;
    for (let i = 0; i < fixedKeys.length; i++) {
      found = this._collectValue(paths[i].path, path)
        .find(item => ReferenceExpressionResolver.keyFromData(item, paths[i].keyPath) === fixedKeys[i]);
      if (!found) { return undefined; }
      path = found.path;
    }
    return found;
  }

  public hints(path: DataPath): HintForAutoComplete[] {
    if (this._expression.currentType !== 'keys') { return []; }
    const fixedData = this.fixedData(path);
    const { fixedKeys, currentKey } = this._expression;
    const currentPath = this._referenceDefinition.paths[fixedKeys.length];
    if (!currentPath) { return []; }
    const collected = fixedData
      ? fixedData.data.collectValue(currentPath.path, fixedData.path)
      : this._collectValue(currentPath.path, path);
    return collected.map(item => {
      const lastMark = this.isLast ? '}}' : '.';
      const key = ReferenceExpressionResolver.keyFromData(item, currentPath.keyPath);
      if (!key || (currentKey && !key.startsWith(currentKey))) { return undefined; }
      return {
        text: `${this._expression.category}:${fixedKeys.map(key => key + '.').join('')}${key}${lastMark}`,
        key,
        displayText: currentPath.description ? currentPath.description.fill(item.data, item.index) : ''
      };
    }).filter(item => !!item) as HintForAutoComplete[];
  }

  public resolve(path: DataPath): { data: DataModelBase, path: DataPath } | undefined {
    const { keys } = this._expression;
    const { paths } = this._referenceDefinition;
    if (keys.length !== paths.length) { return undefined; }

    let found: { data: DataModelBase, path: DataPath } | undefined;
    for (let i = 0; i < keys.length; i++) {
      found = this._collectValue(paths[i].path, path)
        .find(item => ReferenceExpressionResolver.keyFromData(item, paths[i].keyPath) === keys[i]);
      if (!found) { return undefined; }
      path = found.path;
    }
    return found;
  }
}