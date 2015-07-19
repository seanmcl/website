'use strict';

import React from 'react';
import { PropTypes as Types } from 'react';
import Store from '../stores/ProblemBrowserStore';
import { makeFileRoute } from '../stores/ProblemBrowserStore';

import { PROBLEM_MAX_SIZE, getProblemBrowserIndex, getProblemBrowserFile } from '../Util';
import { Button, ButtonGroup, ButtonToolbar, Col, DropdownButton, Grid, Input, Nav, NavItem, Panel, Row } from 'react-bootstrap';
import { ButtonLink, MenuItemLink, NavItemLink } from 'react-router-bootstrap';
import { Link } from 'react-router';
import Util from '../Util';
import Marked from 'marked';
import R from 'ramda';
import Highlight from 'highlight.js';
import $ from 'jquery';

require('../../css/idea.css');

const MAX_PROBLEMS = 30;
const getStateFromStore = () => Store.get();


/**
 *
 */
export default class ProblemBrowserContainer extends React.Component {
  constructor() {
    super();
    this.state = getStateFromStore();
    this._onChange = this._onChange.bind(this);
    this._loadFile = this._loadFile.bind(this);
  }

  componentDidMount() {
    if (this.state.index.isEmpty()) getProblemBrowserIndex();
    this._loadFile(this.props);
    Store.addChangeListener(this._onChange);
  }

  _loadFile(problemSet, type, name) {
    const { index, files } = this.state;
    if (!problemSet || !type || !name || index.isEmpty()) return;
    const pset = index.getProblemSet(problemSet);
    const problem = pset.problemOrAxiom(type, name);
    const filename = problem.file();
    if (filename && !(filename in files) && problem.size() < PROBLEM_MAX_SIZE) {
      getProblemBrowserFile(filename);
    }
  }

  componentWillUpdate() {
    const { problemSet, type, name } = this.props.params;
    this._loadFile(problemSet, type, name);
  }

  componentWillReceiveProps(props) {
    const { problemSet, type, name } = props.params;
    this._loadFile(problemSet, type, name);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(getStateFromStore());
  }

  render() {
    let { problemSet, type, name } = this.props.params;
    const { index, files } = this.state;

    const problemSetNames = index.problemSetNames();
    const defaultProblemSet = () => {
      if (problemSetNames.length > 0) return problemSetNames[0];
      return null;
    };
    problemSet = problemSet || defaultProblemSet();

    const pset = index.getProblemSet(problemSet);
    const problems = pset ? pset.problems() : null;
    const axioms = pset ? pset.axioms() : null;

    type = type || 'problems';

    const defaultName = () => {
      if (problems && type === 'problems' && problems.length > 0) return problems[0].name();
      if (axioms && type === 'axioms' && axioms.length > 0) return axioms[0].name();
      return null;
    };

    name = name || defaultName();
    this._loadFile(problemSet, type, name);
    const problem = pset ? pset.problemOrAxiom(type, name) : null;
    const file = problem ? problem.file() : null;
    const body = file ? files[file] : null;
    return <ProblemBrowser problems={problems}
                           axioms={axioms}
                           type={type}
                           problem={problem}
                           problemSet={problemSet}
                           problemSetNames={problemSetNames}
                           problemBody={body} />;
  }
}

/**
 *
 */
class ProblemBrowser extends React.Component {
  render() {
    const { axioms, problemBody, problem, problems, problemSet, problemSetNames, type } = this.props;
    const display = type === 'axioms' ? axioms : problems;
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <ButtonToolbar style={{marginBottom: 20}}>
              <ProblemSetChooser problemSet={problemSet}
                                 problemSetNames={problemSetNames} />
              <TypeChooser type={type}
                           hasAxioms={axioms && axioms.length !== 0}
                           problemSet={problemSet} />
            </ButtonToolbar>
          </Col>
        </Row>
        <Row>
          <Col md={2}><ProblemList problems={display} /></Col>
          <Col md={10}><ProblemDisplay problem={problem}
                                       problemSet={problemSet}
                                       body={problemBody} /></Col>
        </Row>
      </Grid>
    );
  }
}

ProblemBrowser.propTypes = {
  axioms: Types.arrayOf(Types.object),
  problemBody: Types.string,
  problem: Types.object,
  problems: Types.arrayOf(Types.object),
  problemSet: Types.string,
  problemSetNames: Types.arrayOf(Types.string),
  type: Types.string
};


/**
 *
 */
class ProblemSetChooser extends React.Component {
  render() {
    const { problemSet, problemSetNames } = this.props;
    return (
      <ButtonGroup style={{marginRight: 20}}>
        {problemSetNames.map(s =>
          <ButtonLink active={problemSet === s} key={s} to={`/imogen/problems/${s}`}>
            {s}
          </ButtonLink>)}
      </ButtonGroup>
    );
  }
}

ProblemSetChooser.propTypes = {
  problemSet: Types.string,
  problemSetNames: Types.arrayOf(Types.string).isRequired
};


/**
 *
 */
class TypeChooser extends React.Component {
  render() {
    const { problemSet, type, hasAxioms } = this.props;
    const types = ['problems', 'axioms'];
    return (
      <ButtonGroup>
        {types.map(t =>
            <ButtonLink key={t}
                        active={type === t}
                        disabled={!problemSet || (!hasAxioms && t === 'axioms')}
                        to={`/imogen/problems/${problemSet}/${t}`}>
              {t}
            </ButtonLink>
        )}
      </ButtonGroup>
    );
  }
}

TypeChooser.propTypes = {
  type: Types.string,
  problemSet: Types.string,
  hasAxioms: Types.bool
};


/**
 *
 */
class ProblemList extends React.Component {
  constructor() {
    super();
    this.state = {filter: ''};
    this._handleChange = this._handleChange.bind(this);
  }

  _handleChange() {
    this.setState({filter: this.refs.input.getValue()});
  }

  render() {
    const { problems } = this.props;
    if (!problems) return null;
    const regex = new RegExp(this.state.filter ? this.state.filter.replace(/ /, '.*') : '.*', 'i');
    const filteredProblems = problems.filter(p => p.matches(regex));
    const displayedProblems = R.take(MAX_PROBLEMS)(filteredProblems);
    return (
      <div style={{width: 120}}>
        <Input type='text'
               ref='input'
               style={{marginBottom: 20}}
               value={this.state.value}
               placeholder='Filter'
               onChange={this._handleChange}/>
        <span>Count: {filteredProblems.length}</span>
        <ul style={{listStyleType: 'none', marginTop: 20, paddingLeft: 0}}>
          {displayedProblems.map(p =>
            <li key={p.name()}><Link to={p.route()}>{p.name()}</Link></li>)}
        </ul>
      </div>
    );
  }
}

ProblemList.propTypes = {
  problems: Types.arrayOf(Types.object)
};


/**
 *
 */
class ProblemDisplay extends React.Component {
  constructor() {
    super();
    this._highlightCode = this._highlightCode.bind(this);
  }

  componentDidMount() {
    this._highlightCode();
  }

  componentDidUpdate() {
    this._highlightCode();
  }

  _highlightCode() {
    const { problemSet } = this.props;
    const domNode = React.findDOMNode(this);
    const nodes = domNode ? domNode.querySelectorAll('pre code') : [];
    const unquote = s => s.replace(/[\'\"]/g, '');
    const makeLink = s => {
      const name = unquote(s).replace(/Axioms\//, '').replace(/\.ax/, '');
      const route = makeFileRoute(problemSet, 'axioms', name);
      return `<a href='/#${route}'>${s}</a>`
    };
    for (let i = 0; i < nodes.length; i = i + 1) {
      const node = nodes[i];
      Highlight.highlightBlock(node);
      const inodes1 = node.querySelectorAll('.hljs-string');
      const inodes = R.filter(n => n.innerHTML.startsWith('\'Axioms'))(inodes1);
      for (let j = 0; j < inodes.length; j = j + 1) {
        const inode = inodes[j];
        inode.innerHTML = makeLink(inode.innerHTML);
      }
    }
  }

  render() {
    const { problem, body } = this.props;
    if (!problem) return null;
    if (problem.size() > PROBLEM_MAX_SIZE) {
      return (
        <div style={{width: 600}}>
          <Panel header='Error' bsStyle='danger'>
            Problem is too large to display. ({problem.size()} bytes)
          </Panel>
        </div>
      );
    }
    if (!body) return <h4>Loading...</h4>;
    return (
      <div style={{fontSize: 16}}>
        <pre>
          <code className='prolog'>
            {body}
          </code>
        </pre>
      </div>
    );
  }
}

ProblemDisplay.propTypes = {
  problem: Types.object,
  problemSet: Types.string,
  body: Types.string
};

ProblemDisplay.contextTypes = {
  router: Types.func.isRequired
};