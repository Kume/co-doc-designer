import handsontable from 'handsontable';
import { HandsonTableSettings } from './ReferenceTextCellEditor';
import { MultiSelectCellSetting } from '../../UIModel/TableRowUIModel';
import SelectUIModel from '../../UIModel/SelectUIModel';

export default function SelectCellRenderer (
  this: any,
  instance: any,
  td: HTMLTableDataCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: any,
  cellProperties: MultiSelectCellSetting
) {
  const baseEditor = handsontable.renderers.BaseRenderer;
  baseEditor.apply(this, arguments);
  const settings = instance.getSettings() as HandsonTableSettings;
  let child;
  while (child = td.lastChild) {
    td.removeChild(child);
  }

  if (Array.isArray(cellProperties.value)) {
    const options = SelectUIModel.options(settings.collectValue, cellProperties.definition, cellProperties.dataPath);
    for (const value of cellProperties.value) {
      td.appendChild(document.createTextNode(SelectUIModel.labelForValue(options, settings.collectValue, value)));
      td.appendChild(document.createElement('br'));
    }
  }
}

(handsontable.renderers as any).registerRenderer('multi_select', SelectCellRenderer);