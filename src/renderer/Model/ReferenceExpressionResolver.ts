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
  private readonly _currentDataPath: DataPath;

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
    collectValue: CollectValue,
    currentDataPath: DataPath
  ) {
    this._expression = expression;
    this._referenceDefinition = referenceDefinition;
    this._collectValue = collectValue;
    this._currentDataPath = currentDataPath;
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

  public get fixedData(): { data: DataModelBase, path: DataPath } | undefined {
    const { fixedKeys } = this._expression;
    if (fixedKeys.length === 0) { return undefined; }

    const paths = this._referenceDefinition.paths;
    const collected = this._collectValue(paths[0].path, this._currentDataPath);
    return collected.find(item => ReferenceExpressionResolver.keyFromData(item, paths[0].keyPath) === fixedKeys[0]);
  }

  public get hints(): HintForAutoComplete[] {
    if (this._expression.currentType !== 'keys') { return []; }
    const { fixedData } = this;
    const { fixedKeys, currentKey } = this._expression;
    const currentPath = this._referenceDefinition.paths[fixedKeys.length];
    if (!currentPath) { return []; }
    const collected = fixedData
      ? fixedData.data.collectValue(currentPath.path, fixedData.path)
      : this._collectValue(currentPath.path, this._currentDataPath);
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
}