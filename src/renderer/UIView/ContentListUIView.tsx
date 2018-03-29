import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import ContentListUIModel, { ContentListIndex } from '../UIModel/ContentListUIModel';
import UIViewFactory from './UIViewFactory';
import DataModelBase, { CollectionDataModel, CollectionIndex } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import { default as CollectionDataModelUtil, collectionIndexToKey } from '../DataModel/CollectionDataModelUtil';
import DataPathElement from '../DataModel/DataPathElement';

interface Props extends UIViewBaseProps {
  model: ContentListUIModel;
  data: CollectionDataModel;
}

interface State extends UIViewBaseState {}

export default class ContentListUIView extends UIViewBase<Props, State> {
  public render(): React.ReactNode {
    const factory = new UIViewFactory();
    const ContentComponent = factory.createUIView(this.props.model.content);

    return (
      <div className="ui-content-list-container">
        <ul>
          {
            this.props.model.getIndexes(this.props.data).map((index: ContentListIndex) => {
              return (
                <li
                  key={collectionIndexToKey(index.index)}
                  onClick={() => this.onEditContextChanged(index.index)}
                >
                  {index.title}
                </li>
              );
            })
          }
        </ul>
        <div>
          {
            this.currentIndex && (
              <ContentComponent
                model={this.props.model.content}
                data={this._currentData()}
                onUpdate={(path: DataPath, value: DataModelBase) => {
                  const index = this.currentIndexPathElement;
                  if (index !== undefined) { this.props.onUpdate(path.unshift(index), value); }
                }}
                indexInParent={this.currentIndex}
                onSetEditContext={(context: EditContext) => {
                  this.props.onSetEditContext(context); // TODO
                }}
                editContext={this.props.editContext} // TODO
              />
            )
          }
        </div>
      </div>
    );
  }

  private onEditContextChanged(index: CollectionIndex) {
    this.props.onSetEditContext(new EditContext({
      path: new DataPath(CollectionDataModelUtil.indexToPathElement(index))
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
    return index === undefined ? undefined : CollectionDataModelUtil.indexToPathElement(index);
  }

  private get currentIndex(): CollectionIndex | undefined {
    return this.props.editContext.currentIndexForData(this.props.data);
  }
}
