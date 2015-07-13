'use strict';

import React from 'react';
import { PropTypes as Types } from 'react';
import Store from '../stores/QuotesStore.js';
import { getQuotes } from '../Util.js';

const getStateFromStore = () => Store.get();

/**
 *
 */
export default class QuotesContainer extends React.Component {
  constructor() {
    super();
    this.state = getStateFromStore();
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    getQuotes();
    Store.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(getStateFromStore());
  }

  render() {
    return <Quotes quotes={this.state.quotes} />;
  }
}


/**
 *
 */
class Quote extends React.Component {
  constructor() {
    super();
    this.state = Store.get();
  }

  render() {
    return (
      <blockquote style={{maxWidth: 500}}>
        {this.props.body}
        <footer>{this.props.author || this.props.source}</footer>
      </blockquote>
    );
  }
}

Quote.propTypes = {
  author: Types.string,
  body: Types.string.isRequired,
  date: Types.string,
  location: Types.string,
  notes: Types.string,
  source: Types.string,
};


/**
 *
 */
class Quotes extends React.Component {
  render() {
    return (
      <div>
        <h1>My Quotes!</h1>
        <ul>
          {this.props.quotes.map(q => <li key={q.body}><Quote {...q} /></li>)}
        </ul>
      </div>
    );
  }
}

Quotes.propTypes = {
  quotes: Types.arrayOf(Types.object).isRequired
};
