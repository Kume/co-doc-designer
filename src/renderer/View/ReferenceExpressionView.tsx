import * as React from 'react';
import './style/ReferenceExpressionView';

interface ReferenceExpressionViewProps {
  category: string;
  keys: string;
}

export class ReferenceExpressionView extends React.Component<ReferenceExpressionViewProps> {
  public render(): React.ReactNode {
    return (
      <span className="reference-expression-category">
        {this.props.category}
        <span className="reference-expression-keys">
          {this.props.keys}
        </span>
      </span>
    );
  }
}