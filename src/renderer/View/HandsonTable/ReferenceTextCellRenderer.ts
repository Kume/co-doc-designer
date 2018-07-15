import handsontable from 'handsontable';
import { ReferenceCellSetting } from '../../UIModel/TableRowUIModel';
import { HandsonTableSettings } from './ReferenceTextCellEditor';
import TemplateEngine from '../../Model/TemplateEngine';
import ReferenceExpression from '../../Model/ReferenceExpression';
import Tooltip from 'tooltip.js';
import '../style/ReferenceExpressionView';
import ReferenceExpressionResolver from '../../Model/ReferenceExpressionResolver';
import { TemplateReference } from '../../UIDefinition/TextUIDefinition';
import { CollectValue } from '../../UIModel/types';
import DataPath from '../../DataModel/Path/DataPath';

function makeToken(
  text: string,
  referenceDefinitions: ReadonlyArray<TemplateReference>,
  collectValue: CollectValue,
  focus: (path: DataPath) => void,
  dataPath: DataPath
) {
  try {
    const refExp = new ReferenceExpression(text);
    const parentSpan = document.createElement('span');
    parentSpan.appendChild(document.createTextNode(refExp.category || '-'));
    parentSpan.className = 'reference-expression-category';
    const keysSpan = document.createElement('span');
    keysSpan.appendChild(document.createTextNode(refExp.keyText));
    keysSpan.className = 'reference-expression-keys';
    parentSpan.appendChild(keysSpan);

    parentSpan.onclick = () => {
      const definition = referenceDefinitions.find(def => def.key === refExp.category);
      if (!definition) { return; }
      const resolver = new ReferenceExpressionResolver(refExp, definition, collectValue);
      const resolved = resolver.resolve(dataPath);
      if (!resolved) { return; }
      focus(resolved.path);
    };

    /* tslint:disable:no-unused-expression */
    new Tooltip(parentSpan, {
      title: () => {
        const definition = referenceDefinitions.find(def => def.key === refExp.category);
        if (!definition) { return 'reference error!'; }
        const resolver = new ReferenceExpressionResolver(refExp, definition, collectValue);
        const resolved = resolver.resolve(dataPath);
        if (!resolved) { return 'reference error!'; }
        const pathReference = definition.paths[definition.paths.length - 1];
        const collectionIndex = resolved.path.isEmptyPath
          ? undefined
          : resolved.path.lastElement.asCollectionIndexOrUndefined();
        return pathReference.description
          ? pathReference.description.fill(resolved.data, collectionIndex)
          : resolved.data.toString();
      },
      placement: 'bottom',
    });
    return parentSpan;
  } catch (error) {
    const errorSpan = document.createElement('span');
    errorSpan.appendChild(document.createTextNode('error!'));
    errorSpan.className = 'reference-expression-error';
    return errorSpan;
  }

}

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
        td.appendChild(makeToken(
          element.text!,
          cellProperties.references,
          settings.collectValue,
          settings.focus,
          cellProperties.dataPath));
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