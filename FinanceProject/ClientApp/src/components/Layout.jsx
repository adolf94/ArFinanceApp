import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import BottomAppBar from './BottomAppBar';

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div>
        <Container>
          {this.props.children}
        </Container>
        <BottomAppBar />
      </div>
    );
  }
}
