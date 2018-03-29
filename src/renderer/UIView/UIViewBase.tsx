import * as React from 'react';
import UIModelBase from '../UIModel/UIModelBase';
import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';

export interface OnUpdateData {
  (path: DataPath, model: DataModelBase): void;
}

export interface OnSetEditContext {
  (context: EditContext): void;
}

export interface UIViewBaseProps {
  model: UIModelBase;
  data: DataModelBase | undefined;
  indexInParent?: CollectionIndex;
  onUpdate: OnUpdateData;
  onSetEditContext: OnSetEditContext;
  editContext: EditContext;
}

export interface UIViewBaseState {}

export default class UIViewBase<P extends UIViewBaseProps, S extends UIViewBaseState> extends React.Component<P, S> {
}
