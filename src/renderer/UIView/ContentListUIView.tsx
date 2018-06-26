import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIViewFactory from './UIViewFactory';
import ContentListUIModel2, { ContentListIndex } from '../UIModel2/ContentListUIModel2';

export default class ContentListUIView
  extends UIViewBase<ContentListUIModel2, UIViewBaseProps<ContentListUIModel2>, UIViewBaseState> {
  constructor (props: UIViewBaseProps<ContentListUIModel2>, context?: any) {
    super(props, context);

    this.openAddFormModal = this.openAddFormModal.bind(this);
    this.moveUpForIndex = this.moveUpForIndex.bind(this);
    this.moveDownForIndex = this.moveDownForIndex.bind(this);
  }

  public render(): React.ReactNode {
    const { child } = this.props.model;
    const ContentComponent = child && UIViewFactory.createUIView(child);

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
                    onClick={() => this.props.focus(index.path)}
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
          {ContentComponent && <ContentComponent
            model={child}
            applyAction={this.props.applyAction}
            collectValue={this.props.collectValue}
            focus={this.props.focus}
          />}
        </div>
      </div>
    );
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
}
