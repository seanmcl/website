'use strict';

import React from 'react';
import { PropTypes as Types } from 'react';
import Store from '../stores/ThesisStore';
import { getThesisPages } from '../Util';
import { ScatterChart } from 'react-d3';
import Moment from 'moment';

const getStateFromStore = () => Store.get();

/**
 *
 */
export default class ThesisContainer extends React.Component {
  constructor() {
    super();
    this.state = getStateFromStore();
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    getThesisPages();
    Store.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(getStateFromStore());
  }

  render() {
    return <Thesis pages={this.state.pages} />;
  }
}


/**
 *
 */
class Thesis extends React.Component {
  render() {
    return (
      <div>
        <h1>Thesis!</h1>
        <Pages data={this.props.pages} />
      </div>
    );
  }
}

Thesis.propTypes = {
  pages: Types.arrayOf(Types.shape({
    date: Types.string.isRequired,
    pages: Types.number.isRequired
  })).isRequired
};

/**
 *
 */
class Pages extends React.Component {
  render() {
    const data = [
      {name: 'pages', values: this.props.data.map(d => ({x: new Date(d.date), y: d.pages}))}
    ];
    const formatDate = d => d.getDate() == 1 ? Moment(d).format('YYYY-MM') : '';
    return (
      <div>
        <ScatterChart
          data={data}
          width={500}
          height={400}
          yHideOrigin={true}
          title="Pages"
          xAxisFormatter={formatDate}
          />
      </div>
    );
  }
}

Pages.propTypes = {
  data: Thesis.propTypes.pages
};
