import DataModelBase from './DataModelBase';
import { Record } from 'immutable';
import DataPath from './DataPath';

export type ScalarDataSource = number | string | boolean | null;

export enum ScalarDataModelType {
  Null,
  String,
  Boolean,
  Number
}

const ScalarDataModelRecord = Record({
  type: ScalarDataModelType.Null,
  value: null
});

export default class ScalarDataModel extends ScalarDataModelRecord implements DataModelBase {
  public readonly type: ScalarDataModelType;
  public readonly value: any;

  private static getValueType(value: any) {
    let type: ScalarDataModelType = ScalarDataModelType.Null;
    if (value === null) {
      type = ScalarDataModelType.Null;
      value = null;
    } else if (typeof value === 'string') {
      type = ScalarDataModelType.String;
    } else if (typeof value === 'number') {
      type = ScalarDataModelType.Number;
    } else if (typeof value === 'boolean') {
      type = ScalarDataModelType.Boolean;
    }
    return {value, type};
  }

  constructor(value: ScalarDataSource = null) {
    super(ScalarDataModel.getValueType(value));
  }

  public setValue(path: DataPath, value: DataModelBase): DataModelBase {
    if (path.elements.isEmpty()) {
      return value;
    } else {
      throw new Error();
    }
  }

  public getValue(path: DataPath): ScalarDataModel | undefined {
    if (path.elements.isEmpty()) {
      return this;
    } else {
      return undefined;
    }
  }

  public removeValue(path: DataPath): this {
    throw Error();
  }

  public toJsonObject(): any {
    return this.value;
  }

  public toString(): string {
    if (this.type === ScalarDataModelType.String) {
      return this.value;
    } else {
      return JSON.stringify(this.toJsonObject());
    }
  }
}
