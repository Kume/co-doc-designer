import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIViewFactory from './UIViewFactory';
import ContentListUIModel, { ContentListIndex } from '../UIModel/ContentListUIModel';

export default class ContentListUIView
  extends UIViewBase<ContentListUIModel, UIViewBaseProps<ContentListUIModel>, UIViewBaseState> {
  constructor (props: UIViewBaseProps<ContentListUIModel>, context?: any) {
    super(props, context);

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
    this.moveUpForIndex = this.moveUpForIndex.bind(this);
    this.moveDownForIndex = this.moveDownForIndex.bind(this);
  }

  public render(): React.ReactNode {
    const { model } = this.props;
    const { child } = model;
    const ContentComponent = child && UIViewFactory.createUIView(child);

    return (
      <div className="ui-content-list--container">
        <div>
          <input type="text" className="ui-content-list--search-input" />
          <ul className="ui-content-list--list">
            {
              model.indexes.map((index: ContentListIndex) => {
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
            <input type="button" value="+" onClick={this.add} />
            <input type="button" value="-" onClick={this.delete} />
            <input type="button" value="↑" onClick={this.moveUpForIndex} disabled={!model.canMoveUp} />
            <input type="button" value="↓" onClick={this.moveDownForIndex} disabled={!model.canMoveDown} />
          </div>
        </div>
        <div>
          {ContentComponent && <ContentComponent
            model={child!}
            applyAction={this.props.applyAction}
            collectValue={this.props.collectValue}
            focus={this.props.focus}
          />}
        </div>
      </div>
    );
  }

  private moveUpForIndex() {
    this.props.applyAction(this.props.model.moveUp());
  }

  private moveDownForIndex() {
    this.props.applyAction(this.props.model.moveDown());
  }

  private add() {
    this.props.applyAction(this.props.model.add());
  }

  private delete() {
    this.props.applyAction(this.props.model.delete());
  }
}
