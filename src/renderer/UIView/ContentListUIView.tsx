import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIViewFactory from './UIViewFactory';
import ContentListUIModel, { ContentListIndex } from "../UIModel/ContentListUIModel";

interface Props extends UIViewBaseProps {
  model: ContentListUIModel;
}

interface State extends UIViewBaseState {
}

export default class ContentListUIView extends UIViewBase<Props, State> {
  constructor (props: Props, context?: any) {
    super(props, context);

    this.openAddFormModal = this.openAddFormModal.bind(this);
    this.moveUpForIndex = this.moveUpForIndex.bind(this);
    this.moveDownForIndex = this.moveDownForIndex.bind(this);
  }

  private moveUpForIndex() {
    this.props.model.moveUp(this.props.dispatch);
  }

  private moveDownForIndex() {
    this.props.model.moveDown(this.props.dispatch);
  }

  private openAddFormModal() {
    this.props.model.openAddForm(this.props.dispatch);
  }

  public render(): React.ReactNode {
    const { childModel } = this.props.model;
    const ContentComponent = childModel && UIViewFactory.createUIView(childModel);

    return (
      <div className="ui-content-list--container">
        <div>
          <input type="text" className="ui-content-list--search-input" />
          <ul className="ui-content-list--list">
            {
              this.props.model.indexes.map((index: ContentListIndex) => {
                return (
                  <li
                    key={index.index}
                    onClick={() => this.props.model.selectIndex(this.props.dispatch, index.index)}
                    className={index.isSelected ? 'selected' : ''}
                  >
                    {index.title}
                  </li>
                );
              })
            }
          </ul>
          <div className="ui-content-list--button-area">
            <input type="button" value="+" onClick={this.openAddFormModal} />
            <input type="button" value="↑" onClick={this.moveUpForIndex} />
            <input type="button" value="↓" onClick={this.moveDownForIndex} />
          </div>
        </div>
        <div>
          { ContentComponent && <ContentComponent model={childModel!} dispatch={this.props.dispatch} /> }
        </div>
      </div>
    );
  }
}
