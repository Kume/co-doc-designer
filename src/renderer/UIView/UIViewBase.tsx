import * as React from 'react';
import DataModelBase from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';
import EditContext from '../UIModel/EditContext';
import { CollectValue } from '../UIModel/UIModel';
import { UIModelAction } from '../UIModel2/UIModel2Actions';
import UIModel2 from '../UIModel2/UIModel2';

export interface OnUpdateData {
  (path: DataPath, model: DataModelBase): void;
}

export interface OnSetEditContext {
  (context: EditContext): void;
}

export interface OpenModal {
  (context: React.ReactNode): void;
}

export interface UIViewBaseProps <T extends UIModel2<any>> {
  model: T;
  applyAction: (actions: UIModelAction[]) => void;
  collectValue: CollectValue;
}

export interface UIViewBaseState {}

export default class UIViewBase<
  T extends UIModel2<any>,
  P extends UIViewBaseProps<T>,
  S extends UIViewBaseState
  > extends React.Component<P, S> {}
