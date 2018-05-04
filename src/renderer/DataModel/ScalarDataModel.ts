import DataModelBase from './DataModelBase';
import { Record } from 'immutable';
import DataPath from './DataPath';

export type ScalarDataSource = number | string | boolean | null | Date;

export enum ScalarDataModelType {
  Null,
  String,
  Boolean,
  Integer,
  Float,
  Date
}

const ScalarDataModelRecord = Record({
  type: ScalarDataModelType.Null,
  value: null
});

export default class ScalarDataModel extends ScalarDataModelRecord implements DataModelBase {
  public readonly type: ScalarDataModelType;
  public readonly value: any;

  constructor(value: ScalarDataSource, type: ScalarDataModelType) {
    super({value, type});
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

  public collectValue(path: DataPath): Array<DataModelBase> {
    if (path.elements.isEmpty()) {
      return [this];
    } else {
      return [];
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

export class StringDataModel extends ScalarDataModel {
  public static readonly empty: StringDataModel = new StringDataModel('');

  public readonly value: string;

  constructor(value: string) {
    super(value, ScalarDataModelType.String);
  }
}

export class NumberDataModel extends ScalarDataModel {
  public readonly value: number;
}

export class IntegerDataModel extends NumberDataModel {
  constructor(value: number) {
    super(value, ScalarDataModelType.Integer);
  }
}

export class FloatDataModel extends NumberDataModel {
  constructor(value: number) {
    super(value, ScalarDataModelType.Float);
  }
}

export class BooleanDataModel extends ScalarDataModel {
  public readonly value: boolean;

  constructor(value: boolean) {
    super(value, ScalarDataModelType.Boolean);
  }
}

export class NullDataModel extends ScalarDataModel {
  public static readonly null: NullDataModel = new NullDataModel();

  public readonly value: null;

  constructor() {
    super(null, ScalarDataModelType.Null);
  }
}

export class DateDataModel extends ScalarDataModel {
  public readonly value: Date;

  constructor(value: Date) {
    super(value, ScalarDataModelType.Date);
  }
}
