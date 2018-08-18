import * as React from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  disabled?: boolean;
  icon: IconProp;
  onClick: () => void;
}

interface State {
  isMouseOver: boolean;
}

export default class IconButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isMouseOver: false
    };
  }

  render(): React.ReactNode {
    const { disabled, icon } = this.props;
    let color = '#666';

    if (disabled) {
      color = '#bbb';
    } else if (this.state.isMouseOver) {
      color = 'blue';
    }
    return (
      <div
        style={{padding: '7px'}}
        onClick={() => {if (!disabled) { this.props.onClick(); }}}
        onMouseOver={() => this.setState({isMouseOver: true})}
        onMouseLeave={() => this.setState({isMouseOver: false})}
      >
        <FontAwesomeIcon icon={icon} size="lg" color={color} />
      </div>
    );
  }
}