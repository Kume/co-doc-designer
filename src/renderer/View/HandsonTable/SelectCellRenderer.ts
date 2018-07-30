import handsontable from 'handsontable';
import { HandsonTableSettings } from './ReferenceTextCellEditor';
import { MultiSelectCellSetting } from '../../UIModel/TableRowUIModel';

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

  for (const value of cellProperties.model.value as any[]) {
    td.appendChild(document.createTextNode(cellProperties.model.labelForValue(settings.collectValue, value)));
    td.appendChild(document.createElement('br'));
  }
}

(handsontable.renderers as any).registerRenderer('multi_select', SelectCellRenderer);