import * as React from 'react';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';

export interface OnUpdateData {
  (path: DataPath, model: DataModelBase): void;
}

export interface OnSetEditContext {
  (context: EditContext): void;
}

export interface OpenModal {
  (context: React.ReactNode): void;
}

interface Function {
  (): void;
}

export interface UIViewBaseProps {
  model: UIDefinitionBase;
  data: DataModelBase | undefined;
  indexInParent?: CollectionIndex;
  onUpdate: OnUpdateData;
  onSetEditContext: OnSetEditContext;
  editContext: EditContext;
  openModal?: OpenModal;
  closeModal?: Function;
}

export interface UIViewBaseState {}

export default class UIViewBase<P extends UIViewBaseProps, S extends UIViewBaseState> extends React.Component<P, S> {
}
