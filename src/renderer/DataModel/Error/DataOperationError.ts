import ErrorBase from '../../../common/Error/ErrorBase';
import DataPath from '../Path/DataPath';
import DataModelBase from '../DataModelBase';
import { DataAction } from '../DataAction';

interface DataOperationErrorProps {
  path?: DataPath;
  targetData?: DataModelBase;
  action?: DataAction;
}

export default class DataOperationError extends ErrorBase {
  public readonly path?: DataPath;
  public readonly targetData?: DataModelBase;
  public readonly action?: DataAction;

  constructor(message: string, props: DataOperationErrorProps) {
    super(message);
    this.path = props.path;
    this.targetData = props.targetData;
    this.action = props.action;
  }
}