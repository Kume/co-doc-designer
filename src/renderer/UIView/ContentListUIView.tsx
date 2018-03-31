import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import ContentListUIDefinition, { ContentListIndex } from '../UIDefinition/ContentListUIDefinition';
import UIViewFactory from './UIViewFactory';
import DataModelBase, { CollectionDataModel, CollectionIndex } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import DataPathElement from '../DataModel/DataPathElement';
import { StringDataModel } from "../DataModel/ScalarDataModel";
import UIViewModal from "./UIViewModal";
import MapDataModel from "../DataModel/MapDataModel";
import ListDataModel from "../DataModel/ListDataModel";

interface Props extends UIViewBaseProps {
  model: ContentListUIDefinition;
  data: CollectionDataModel;
}

interface State extends UIViewBaseState {
}

export default class ContentListUIView extends UIViewBase<Props, State> {
  constructor (props: Props, context?: any) {
    super(props, context);

    this.onUpdate = this.onUpdate.bind(this);
    this.moveUpForIndex = this.moveUpForIndex.bind(this);
    this.moveDownForIndex = this.moveDownForIndex.bind(this);
  }

  public render(): React.ReactNode {
    const ContentComponent = UIViewFactory.createUIView(this.props.model.content);

    return (
      <div className="ui-content-list--container">
        <div>
          <input type="text" className="ui-content-list--search-input" />
          <ul className="ui-content-list--list">
            {
              this.props.model.getIndexes(this.props.data, this.currentIndex).map((index: ContentListIndex) => {
                return (
                  <li
                    key={index.index}
                    onClick={() => this.onEditContextChanged(index.index)}
                    className={index.isSelected ? 'selected' : ''}
                  >
                    {index.title}
                  </li>
                );
              })
            }
          </ul>
          <div className="ui-content-list--button-area">
            <input type="button"
                   value="+"
                   onClick={this.props.openModal && (() => this.props.openModal!(this.addForm))} />
            <input type="button" value="↑" onClick={this.moveUpForIndex} />
            <input type="button" value="↓" onClick={this.moveDownForIndex} />
          </div>
        </div>
        <div>
          {
            this.currentIndex && (
              <ContentComponent
                model={this.props.model.content}
                data={this._currentData()}
                onUpdate={this.onUpdate}
                indexInParent={this.currentIndex}
                onSetEditContext={(context: EditContext) => {
                  this.props.onSetEditContext(context); // TODO
                }}
                editContext={this.props.editContext} // TODO
                openModal={this.props.openModal}
                closeModal={this.props.closeModal}
              />
            )
          }
        </div>
      </div>
    );
  }

  private get addForm(): React.ReactNode {
    return (
      <UIViewModal
        model={this.props.model.addFormContent}
        data={this.props.model.addFormDefaultValue}
        onComolete={(key, data) => {
          const currentData = this.props.data;
          if (currentData instanceof MapDataModel) {
            if (!key) {
              throw new Error('Key must be string');
            }
            this.props.onUpdate(new DataPath(key.toString()), data);
          } else if (currentData instanceof ListDataModel) {

          }
        }}
      />
    );
  }

  private moveUpForIndex() {
    const index = this.currentIndex;
    if (this.props.editContext.path.elements.isEmpty()) {
      if (!this.currentIndex) { return; }
      this.onEditContextChanged(this.currentIndex);
    }
    if (this.props.data instanceof MapDataModel) {
      this.props.onUpdate(new DataPath([]), this.props.data.moveUpForKey(index as string));
    }
  }

  private moveDownForIndex() {
    const index = this.currentIndex;
    if (this.props.editContext.path.elements.isEmpty()) {
      if (!this.currentIndex) { return; }
      this.onEditContextChanged(this.currentIndex);
    }
    if (this.props.data instanceof MapDataModel) {
      this.props.onUpdate(new DataPath([]), this.props.data.moveDownForKey(index as string));
    }
  }

  private onUpdate(path: DataPath, value: DataModelBase): void {
    const index = this.currentIndexPathElement;
    if (index !== undefined) {
      this.props.onUpdate(path.unshift(index), value);
    }
    if (path.pointsKey && path.elements.isEmpty()) {
      if (value instanceof StringDataModel) {
        this.onEditContextChanged(value.value);
      } else {
        throw new Error('Cant set value as key');
      }
    }
  }

  private onEditContextChanged(index: CollectionIndex) {
    this.props.onSetEditContext(new EditContext({
      path: new DataPath(index)
    }));
  }

  private _currentData(): DataModelBase | undefined {
    const index = this.currentIndexPathElement;
    return index === undefined
      ? undefined
      : this.props.data.getValue(new DataPath(index));
  }

  private get currentIndexPathElement(): DataPathElement | undefined {
    const index = this.currentIndex;
    return index === undefined ? undefined : DataPathElement.create(index);
  }

  private get currentIndex(): CollectionIndex | undefined {
    return this.props.editContext.currentIndexForData(this.props.data);
  }
}
