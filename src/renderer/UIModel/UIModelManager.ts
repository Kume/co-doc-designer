import DataPath from '../DataModel/DataPath';
import DataModelBase from '../DataModel/DataModelBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import UIModel, { UIModelProps } from './UIModel';
import {
  ActionType, ChangeEditContextAction, NotifyDataFunction, OpenModalAction, SetValueAction,
  UIModelAction
} from './UIModelAction';
import { UIModelFactory } from './UIModelFactory';
import EditContext from './EditContext';
import UIModelState from './UIModelState';

interface Function {
  (): void;
}

export class UIModelManager {
  public notifyModelChanged?: Function;
  public notifyModalModelChanged?: Function;
  protected _model: UIModel;
  private _data: DataModelBase;
  private _modelState: UIModelState | undefined;
  private _definition: UIDefinitionBase;
  private _editContext: EditContext = EditContext.empty;
  private _modalData: DataModelBase | undefined;
  private _modalModel: UIModel | undefined;
  private _modalEditContext: EditContext = EditContext.empty;
  private _onModalSubmit: NotifyDataFunction;

  public constructor() {
    this.dispatch = this.dispatch.bind(this);
    this.dispatchForModal = this.dispatchForModal.bind(this);
    this.collectValue = this.collectValue.bind(this);
  }

  public initialize(data: DataModelBase, definition: UIDefinitionBase) {
    const props = {
      definition,
      data,
      editContext: EditContext.empty,
      dataPath: DataPath.empty
    };
    this._model = UIModelFactory.create(props, undefined);
    this._data = data;
    this._definition = definition;
    this._editContext = EditContext.empty;
  }

  public collectValue(targetPath: DataPath, basePath: DataPath): DataModelBase[] {
    return this._data.collectValue(targetPath);
  }

  public dispatch(action: UIModelAction): void {
    switch (action.type) {
      case ActionType.SetValue:
        const setValueAction = action as SetValueAction;
        this.setValue(setValueAction.path, setValueAction.data);
        break;
      case ActionType.ChangeEditContext:
        const changeEditContextAction = action as ChangeEditContextAction;
        this.changeEditContext(changeEditContextAction.editContext);
        break;
      case ActionType.OpenModal:
        const openModalAction = action as OpenModalAction;
        this.openModal(openModalAction.modelProps, openModalAction.onSubmit);
        break;
      case ActionType.CloseModal:
        this.closeModal();
        break;
      default:
        break;
    }
  }

  public dispatchForModal(action: UIModelAction) {
    switch (action.type) {
      case ActionType.SetValue:
        const setValueAction = action as SetValueAction;
        this.setValueForModal(setValueAction.path, setValueAction.data);
        break;
      case ActionType.ChangeEditContext:
        const changeEditContextAction = action as ChangeEditContextAction;
        this.changeEditContext(changeEditContextAction.editContext);
        break;
      case ActionType.OpenModal:
        throw new Error('Cannot open modal on modal.');
      case ActionType.CloseModal:
        this.closeModal();
        break;
      default:
        break;
    }
  }

  public setValue(path: DataPath, data: DataModelBase) {
    try {
      const newData = this._data.setValue(path, data);
      this._modelState = this._model.getState(this._modelState);
      this._model = this._model.updateData(newData, this._modelState);
      this._data = newData;
      if (this.notifyModelChanged) {
        this.notifyModelChanged();
      }
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  public changeEditContext(editContext: EditContext): void {
    try {
      this._modelState = this._model.getState(this._modelState);
      this._model = this._model.updateEditContext(editContext, this._modelState);
      this._editContext = editContext;
      if (this.notifyModelChanged) {
        this.notifyModelChanged();
      }
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  public openModal(modelProps: UIModelProps, onSubmit: NotifyDataFunction): void {
    try {
      this._modalModel = UIModelFactory.create(modelProps, undefined);
      this._modalData = modelProps.data;
      this._onModalSubmit = onSubmit;
      if (this.notifyModelChanged) {
        this.notifyModelChanged();
      }
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  public closeModal(): void {
    this._modalModel = undefined;
    if (this.notifyModelChanged) {
      this.notifyModelChanged();
    }
  }

  public setValueForModal(path: DataPath, data: DataModelBase) {
    try {
      const newData = this._modalData!.setValue(path, data);
      this._modalModel = this._modalModel!.updateData(newData, undefined);
      this._modalData = newData;
      if (this.notifyModelChanged) {
        this.notifyModelChanged();
      }
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  get model(): UIModel {
    return this._model;
  }

  get modalModel(): UIModel | undefined {
    return this._modalModel;
  }

  get definition(): UIDefinitionBase {
    return this._definition;
  }

  get data(): DataModelBase {
    return this._data;
  }

  get onModalSubmit(): NotifyDataFunction {
    return this._onModalSubmit;
  }

  get modalData(): DataModelBase | undefined {
    return this._modalData;
  }

  get editContext(): EditContext {
    return this._editContext;
  }

  get modalEditContext(): EditContext {
    return this._modalEditContext;
  }
}
