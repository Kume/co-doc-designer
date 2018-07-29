import * as React from 'react';
import Select from 'react-select';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import SelectUIModel from '../UIModel/SelectUIModel';
import 'react-select/dist/react-select.css';
import './style/SelectUIView.css';

interface SelectValue {
  label: string;
  value: string;
}

export default class SelectUIView extends UIViewBase<SelectUIModel, UIViewBaseProps<SelectUIModel>, UIViewBaseState> {
  render(): React.ReactNode {
    const { model, collectValue } = this.props;
    return (
      <Select
        value={model.value || ''}
        onChange={this.onUpdate}
        options={model.options(collectValue)}
        multi={model.definition.isMulti}
      />
    );
  }

  constructor(props: UIViewBaseProps<SelectUIModel>, context?: any) {
    super(props, context);
    this.onUpdate = this.onUpdate.bind(this);
  }

  private onUpdate(value: SelectValue | SelectValue[] | null): void {
    if (Array.isArray(value)) {
      this.props.applyAction(this.props.model.input(value.map(v => v.value)));
    } else {
      this.props.applyAction(this.props.model.input(value && value.value));
    }
  }
}