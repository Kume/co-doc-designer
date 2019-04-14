import * as React from 'react';
import DataModelBase from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';
import { UIModelAction } from '../UIModel/UIModelActions';
import UIModel from '../UIModel/UIModel';
import { CollectValue } from '../UIModel/types';

export interface OnUpdateData {
  (path: DataPath, model: DataModelBase): void;
}

export interface OpenModal {
  (context: React.ReactNode): void;
}

export interface UIViewBaseProps <T extends UIModel<any>> {
  model: T;
  applyAction: (actions: UIModelAction[]) => void;
  focus: (path: DataPath) => void;
  collectValue: CollectValue;
}

export interface UIViewBaseState {}

export default class UIViewBase<
  T extends UIModel<any>,
  P extends UIViewBaseProps<T>,
  S extends UIViewBaseState
  > extends React.PureComponent<P, S> {}
