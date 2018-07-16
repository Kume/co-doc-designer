import handsontable from 'handsontable';
import { ReferenceCellSetting } from '../../UIModel/TableRowUIModel';
import { HandsonTableSettings } from './ReferenceTextCellEditor';
import TemplateEngine from '../../Model/TemplateEngine';
import '../style/ReferenceExpressionView';
import { makeReferenceExpressionView } from '../ReferenceExpressionView';

export default function ReferenceTextCellRenderer (
  this: any,
  instance: any,
  td: HTMLTableDataCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: any,
  cellProperties: ReferenceCellSetting
) {
  const baseEditor = handsontable.renderers.BaseRenderer;
  baseEditor.apply(this, arguments);
  const settings = instance.getSettings() as HandsonTableSettings;
  let child;
  while (child = td.lastChild) {
    td.removeChild(child);
  }
  const templateEngine = new TemplateEngine(value);

  for (const element of templateEngine.elements) {
    switch (element.type) {
      case 'text':
        td.appendChild(document.createTextNode(element.text!));
        break;
      case 'token':
        td.appendChild(makeReferenceExpressionView(
          element.text!,
          cellProperties.references,
          settings.collectValue,
          settings.focus,
          cellProperties.dataPath,
          true));
        break;
      case 'break':
        td.appendChild(document.createElement('br'));
        break;
      default:
        break;
    }
  }
}

(handsontable.renderers as any).registerRenderer('reference', ReferenceTextCellRenderer);