'use strict';

import React from 'react';
import { PropTypes as Types } from 'react';
import Store from '../stores/BlogStore.js';
import { getBlogIndex, getBlogEntry } from '../Util.js';
import { Col, Grid, ListGroup, Row } from 'react-bootstrap';
import { ListGroupItemLink } from 'react-router-bootstrap';
import Marked from 'marked';
import Highlight from 'highlight.js';

require('../../node_modules/highlight.js/styles/idea.css');

const getStateFromStore = () => Store.get();


/**
 *
 */
export default class BlogContainer extends React.Component {
  constructor() {
    super();
    this.state = getStateFromStore();
    this._onChange = this._onChange.bind(this);
    this._maybeGetBlogEntry = this._maybeGetBlogEntry.bind(this);
    Marked.setOptions({
      highlight: code => Highlight.highlightAuto(code, ['prolog', 'scala']).value
    });
  }

  _maybeGetBlogEntry(basename) {
    if (!this.state.entries[basename]) {
      getBlogEntry(basename);
    }
  }

  componentDidMount() {
    getBlogIndex();
    this._maybeGetBlogEntry(this.props.params.basename);
    Store.addChangeListener(this._onChange);
  }

  componentWillReceiveProps(props) {
    this._maybeGetBlogEntry(props.params.basename);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(getStateFromStore());
  }

  render() {
    return <Blog index={this.state.index}
                 entries={this.state.entries}
                 basename={this.props.params.basename} />;
  }
}

/**
 *
 */
class Index extends React.Component {
  render() {
    return (
      <div>
        <ListGroup>
          {this.props.index.map(d =>
            <ListGroupItemLink key={d.basename} to={`/blog/${d.basename}`}>
              {`${d.title} (${d.date})`}
            </ListGroupItemLink>)}
        </ListGroup>
      </div>
    );
  }
}

Index.propTypes = {
  index: Types.arrayOf(Types.shape({
    date: Types.string.isRequired,
    basename: Types.string.isRequired,
    title: Types.string.isRequired,
  })).isRequired
};


/**
 *
 */
class Entry extends React.Component {
  render() {
    if (!this.props.body) return null;
    const md = Marked(this.props.body);
    return (
      <div style={{fontSize: 16}} dangerouslySetInnerHTML={{__html: md}} />
    );
  }
}

Entry.propTypes = {
  body: Types.string
};


/**
 *
 */
class Blog extends React.Component {
  render() {
    const body = this.props.entries[this.props.basename];
    if (body) {
      return (
        <div>
          <Grid>
            <Row>
              <Col md={9}>
                <Entry body={body}/>
              </Col>
              <Col md={3}>
                <Index index={this.props.index}/>
              </Col>
            </Row>
          </Grid>
        </div>
      );
    } else {
      return (
        <div>
          <Grid>
            <Row>
              <Col md={6}>
                <Index index={this.props.index}/>
              </Col>
            </Row>
          </Grid>
        </div>
      );
    }
  }
}

Blog.propTypes = {
  index: Types.array.isRequired,
  entries: Types.object.isRequired
};
