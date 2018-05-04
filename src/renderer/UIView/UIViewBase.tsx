import * as React from 'react';
import DataModelBase from '../DataModel/DataModelBase';
import DataPath from '../DataModel/DataPath';
import EditContext from '../UIModel/EditContext';
import { ActionDispatch, CollectValue, default as UIModel } from '../UIModel/UIModel';

export interface OnUpdateData {
  (path: DataPath, model: DataModelBase): void;
}

export interface OnSetEditContext {
  (context: EditContext): void;
}

export interface OpenModal {
  (context: React.ReactNode): void;
}

export interface UIViewBaseProps {
  model: UIModel;
  dispatch: ActionDispatch;
  collectValue: CollectValue;
}

export interface UIViewBaseState {}

export default class UIViewBase<P extends UIViewBaseProps, S extends UIViewBaseState> extends React.Component<P, S> {
}
