import './style/ReferenceExpressionView';
import Tooltip from 'tooltip.js';
import DataPath from '../DataModel/Path/DataPath';
import { CollectValue } from '../UIModel/types';
import ReferenceExpression from '../Model/ReferenceExpression';
import ReferenceExpressionResolver from '../Model/ReferenceExpressionResolver';
import { TemplateReference } from '../UIDefinition/TextUIDefinition';

export function makeReferenceExpressionView(
  text: string,
  referenceDefinitions: ReadonlyArray<TemplateReference>,
  collectValue: CollectValue,
  focus: (path: DataPath) => void,
  dataPath: DataPath,
  useTooltip: boolean
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

    parentSpan.onclick = (event) => {
      if (!event.ctrlKey && !event.metaKey) { return; }
      const definition = referenceDefinitions.find(def => def.key === refExp.category);
      if (!definition) { return; }
      const resolver = new ReferenceExpressionResolver(refExp, definition, collectValue);
      const resolved = resolver.resolve(dataPath);
      if (!resolved) { return; }
      focus(resolved.path);
      return true;
    };

    if (useTooltip) {
      /* tslint:disable:no-unused-expression */
      new Tooltip(parentSpan, {
        title: () => {
          return ReferenceExpressionResolver.resolve(refExp, referenceDefinitions, collectValue, dataPath) || '';
        },
        boundariesElement: document.documentElement,
        placement: 'bottom'
      });
    } else {
      parentSpan.onmouseover = () => {
        parentSpan.title =
          ReferenceExpressionResolver.resolve(refExp, referenceDefinitions, collectValue, dataPath) || '';
      };
    }

    return parentSpan;
  } catch (error) {
    const errorSpan = document.createElement('span');
    errorSpan.appendChild(document.createTextNode('error!'));
    errorSpan.className = 'reference-expression-error';
    return errorSpan;
  }
}