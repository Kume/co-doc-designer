import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TextUIModel from '../UIModel/TextUIModel';
import ReferenceTextEditor from '../View/ReferenceTextEditor';

export default class TextUIView extends UIViewBase<TextUIModel, UIViewBaseProps<TextUIModel>, UIViewBaseState> {
  private _textInput: HTMLInputElement;
  private _textArea: HTMLTextAreaElement;
  private _referenceTextEditor: ReferenceTextEditor;

  componentWillUnmount() {
    if (this._referenceTextEditor) {
      this._referenceTextEditor.dispose();
      delete this._referenceTextEditor;
    }
  }

  componentWillReceiveProps(props: UIViewBaseProps<TextUIModel>) {
    if (this._referenceTextEditor) {
      this._referenceTextEditor.props = this.referenceTextEditorProps(props);
      this._referenceTextEditor.setText(props.model.text);
    }
  }

  render(): React.ReactNode {
    const { model, applyAction } = this.props;
    if (model.definition.references) {
      return (
        <textarea
          defaultValue={model.text}
          onChange={() => applyAction(model.input(this._textArea.value))}
          ref={ref => this.initTextArea(ref)}
        />
      );
    } else if (model.definition.multiline) {
      return (
        <textarea
          defaultValue={model.text}
          onChange={() => applyAction(model.input(this._textArea.value))}
          ref={ref => this.initTextArea(ref)}
        />
      );
    } else {
      return (
        <input
          type="text"
          value={model.text}
          onChange={() => applyAction(model.input(this._textInput.value))}
          ref={ref => this._textInput = ref!}
        />
      );
    }
  }

  private initTextArea(ref: HTMLTextAreaElement | null): void {
    if (!ref || this._textArea) { return; }
    this._textArea = ref;
    this._referenceTextEditor = new ReferenceTextEditor(ref, this.referenceTextEditorProps(this.props));
    this._referenceTextEditor.applyCodeMirror();
  }

  private referenceTextEditorProps(props: UIViewBaseProps<TextUIModel>) {
    const { collectValue, model, applyAction, focus } = props;
    return {
      collectValue,
      dataPath: model.props.dataPath,
      references: model.definition.references,
      onChange: (text: string) => applyAction(model.input(text)),
      focus
    };
  }
}
