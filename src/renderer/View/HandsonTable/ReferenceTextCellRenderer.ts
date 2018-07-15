import handsontable from 'handsontable';
import { ReferenceCellSetting } from '../../UIModel/TableRowUIModel';
import { HandsonTableSettings } from './ReferenceTextCellEditor';
import TemplateEngine from '../../Model/TemplateEngine';
import ReferenceExpression from '../../Model/ReferenceExpression';

function makeToken(text: string) {
  try {
    const refExp = new ReferenceExpression(text);
    const parentSpan = document.createElement('span');
    parentSpan.appendChild(document.createTextNode(refExp.category || '-'));
    parentSpan.className = 'reference-expression-category';
    // parentSpan.onmouseover = () => {
    //   console.log('onmouseover', arguments);
    // };
    const keysSpan = document.createElement('span');
    keysSpan.appendChild(document.createTextNode(refExp.keyText));
    keysSpan.className = 'reference-expression-keys';
    parentSpan.appendChild(keysSpan);
    return parentSpan;
  } catch (error) {
    const errorSpan = document.createElement('span');
    errorSpan.appendChild(document.createTextNode('error!'));
    errorSpan.className = 'reference-expression-error';
    return errorSpan;
  }

}

export default function ReferenceTextCellRenderer (
  instance: any,
  td: HTMLTableDataCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: any,
  cellProperties: ReferenceCellSetting
) {
  const baseEditor = handsontable.renderers.BaseRenderer;
  console.log({value, cellProperties});
  baseEditor.apply(this, arguments);
  const settings = instance.getSettings() as HandsonTableSettings;
  // const reactElement = React.createElement(ReferenceTextView, {
  //   collectValue: settings.collectValue,
  //   // dataPath: cellProperties.dataPath,
  //   references: cellProperties.references,
  //   text: value as string
  // });
  let child;
  while (child = td.lastChild) {
    console.log('remove child', child);
    td.removeChild(child);
  }
  const templateEngine = new TemplateEngine(value);
  console.log(templateEngine.elements);

  for (const element of templateEngine.elements) {
    switch (element.type) {
      case 'text':
        td.appendChild(document.createTextNode(element.text!));
        break;
      case 'token':
        // const refExp = new ReferenceExpression(element.text!);
        td.appendChild(makeToken(element.text!));
        break;
      case 'break':
        td.appendChild(document.createElement('br'));
        break;
      default:
        break;
    }
  }

  // ReactDOM.render(reactElement, td);
  // console.log(td.firstChild);

  // handsontable.dom.fastInnerText(td, 'tetst');
  // td.appendChild(document.createTextNode('test'));
}

(handsontable.renderers as any).registerRenderer('reference', ReferenceTextCellRenderer);