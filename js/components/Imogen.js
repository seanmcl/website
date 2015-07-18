'use strict';

import React from 'react';
import { PropTypes as Types } from 'react';
import Store from '../stores/ImogenStore';
import { Col, Grid, ListGroup, Row } from 'react-bootstrap';
import { ListGroupItemLink } from 'react-router-bootstrap';
const getStateFromStore = () => Store.get();

/**
 *
 */
export default class ImogenContainer extends React.Component {
  constructor() {
    super();
    this.state = getStateFromStore();
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    Store.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(getStateFromStore());
  }

  render() {
    return <Imogen />;
  }
}


/**
 *
 */
class Imogen extends React.Component {
  render() {
    return (
      <div>
        <h1>Imogen!</h1>
        <Grid>
          <Row>
            <Col md={9}>Foo</Col>
            <Col md={3}><Index /></Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

Imogen.propTypes = {
};


/**
 *
 */
class Index extends React.Component {
  render() {
    return (
      <div>
        <ListGroup>
          <ListGroupItemLink to='/imogen/problems'>Problem Browser</ListGroupItemLink>
        </ListGroup>
      </div>
    )
  }
}

