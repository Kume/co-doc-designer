import DataModelBase, { DataCollectionElement } from './DataModelBase';
import { Record } from 'immutable';
import DataPath from './Path/DataPath';
import { DataAction, SetDataAction } from './DataAction';
import DataOperationError from './Error/DataOperationError';
import { DataPathElementMetadata } from './Path/DataPathElement';

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

  applyAction(path: DataPath, action: DataAction, metadata?: DataPathElementMetadata): DataModelBase {
    switch (action.type) {
      case 'Insert':
        throw new DataOperationError('Cannot insert into scalar data.', {action, path, targetData: this});
      case 'Delete':
        throw new DataOperationError('Cannot delete from scalar data.', {action, path, targetData: this});
      case 'Move':
        throw new DataOperationError('Cannot move in scalar data.', {action, path, targetData: this});
      case 'Set':
        if (path.isEmptyPath) {
          return (<SetDataAction> action).data;
        } else {
          throw new DataOperationError('Cannot set under scalar data.', {action, path, targetData: this});
        }
      default:
        throw new DataOperationError('Invalid data action.', {action, path, targetData: this});
    }
  }

  public getValue(path: DataPath): ScalarDataModel | undefined {
    if (path.elements.isEmpty()) {
      return this;
    } else {
      return undefined;
    }
  }

  public collectValue(path: DataPath): DataCollectionElement[] {
    if (path.elements.isEmpty()) {
      return [{data: this}];
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

  public static create(value: string): StringDataModel {
    if (value === '') {
      return this.empty;
    } else {
      return new StringDataModel(value);
    }
  }

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
  public static readonly trueModel = new BooleanDataModel(true);
  public static readonly falseModel = new BooleanDataModel(false);
  public readonly value: boolean;

  public static create(value: boolean): BooleanDataModel {
    return value ? this.trueModel : this.falseModel;
  }

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
