'use strict';

import $ from 'jquery';
import Highlight from 'highlight.js';
import Marked from 'marked';
import R from 'ramda';
import React from 'react';
import Store from '../stores/ProblemBrowserStore';
import Util from '../Util';
import { Button, ButtonGroup, ButtonToolbar, Col, DropdownButton, Grid, Input, MenuItem, Nav, NavItem, Panel, Row } from 'react-bootstrap';
import { ButtonLink, MenuItemLink, NavItemLink } from 'react-router-bootstrap';
import { Column, Table} from 'fixed-data-table';
import { Link } from 'react-router';
import { makeFileRoute } from '../stores/ProblemBrowserStore';
import { PROBLEM_MAX_SIZE, getProblemBrowserIndex, getProblemBrowserFile } from '../Util';
import { PropTypes as Types } from 'react';
import Select from 'react-select';
import { problemBrowserReceiveSelectedClasses, problemBrowserReceiveFilter } from '../SiteActionCreators';

require('../../node_modules/highlight.js/styles/idea.css');
require('../../node_modules/fixed-data-table/dist/fixed-data-table.css');
require('../../node_modules/react-select/dist/default.css');
require('../../css/default.css');
require('../../css/ProblemBrowser.css');

const MAX_PROBLEMS = 30;
const getStateFromStore = () => Store.get();
const buttonToolbarStyle = {marginRight: 20};

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
    const { index, files, selectedClasses, filter } = this.state;

    const problemSetNames = index.problemSetNames();
    const defaultProblemSet = () => {
      if (problemSetNames.length > 0) return problemSetNames[0];
      return null;
    };
    problemSet = problemSet || defaultProblemSet();

    const filterRegexp = new RegExp(filter, 'i');
    const problemFilter = p => p.name().match(filterRegexp) && (selectedClasses.length === 0 || R.any(c => p.name().match(c))(selectedClasses));
    const pset = index.getProblemSet(problemSet);
    const classes = pset ? pset.classes() : [];
    const problems = pset ? pset.problems().filter(problemFilter) : [];
    const axioms = pset ? pset.axioms().filter(problemFilter) : [];

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
    return (
      <div style={{marginTop: 10}}>
        <ProblemBrowser problems={problems}
                        axioms={axioms}
                        type={type}
                        problem={problem}
                        problemSet={problemSet}
                        problemSetNames={problemSetNames}
                        problemBody={body}
                        classes={classes}
                        selectedClasses={selectedClasses}
                        filter={filter} />
      </div>
    );
  }
}

/**
 *
 */
class ProblemBrowser extends React.Component {
  render() {
    const { axioms, problemBody, problem, problems, problemSet, problemSetNames, type, classes, selectedClasses, filter } = this.props;
    const display = type === 'axioms' ? axioms : problems;
    return (
      <Grid>
        <Row style={{marginBottom: 20}}>
          <Col md={12}>
            <ProblemSetChooser problemSet={problemSet}
                               problemSetNames={problemSetNames} />
            <TypeChooser type={type}
                         hasAxioms={axioms && axioms.length !== 0}
                         problemSet={problemSet} />
            <ClassChooser classes={classes}
                          selectedClasses={selectedClasses} />
            <ProblemFilter contents={filter} />
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <ProblemList problems={display}
                         type={type}
                         selectedClasses={selectedClasses} />
          </Col>
          <Col md={10}>
            <ProblemDisplay problem={problem}
                            problemSet={problemSet}
                            body={problemBody} />
          </Col>
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
      <ButtonGroup style={buttonToolbarStyle}>
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
      <ButtonGroup style={buttonToolbarStyle}>
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
class ClassChooser extends React.Component {
  render() {
    const { classes, selectedClasses } = this.props;
    const disabled = !classes || classes.length === 0;
    const onChange = (_, cs) => {
      console.log(`cs: ${cs.map(k => k.label).join(', ')}`);
      problemBrowserReceiveSelectedClasses(cs.map(c => c.label));
    };
    const options = classes.map(c => ({value: c, label: c}));
    return (
      <ButtonGroup style={buttonToolbarStyle}>
        <Select options={options}
                disabled={disabled}
                placeholder='Problem classes'
                onChange={onChange}
                value={selectedClasses}
                multi={true} />
      </ButtonGroup>
    );
  }
}

ClassChooser.propTypes = {
  classes: Types.arrayOf(Types.string),
  selectedClasses: Types.arrayOf(Types.string)
};


/**
 *
 */
class ProblemFilter extends React.Component {
  render() {
    const { contents } = this.props;
    const onChange = () => problemBrowserReceiveFilter(this.refs.input.getValue());
    return (
      <ButtonGroup style={buttonToolbarStyle}>
        <Input type='text'
               value={contents}
               placeholder='Filter'
               ref='input'
               onChange={onChange} />
      </ButtonGroup>
    );
  }
}

ProblemFilter.propTypes = {
  contents: Types.string
};


/**
 *
 */
class ProblemList extends React.Component {
  render() {
    const { problems, type } = this.props;
    if (!problems) return null;
    const rowGetter = n => [problems[n]];
    const width = 150;
    const count = problems.length;
    const cellRenderer = (cellData, cellDataKey, rowData, rowIndex, columnData, width) => {
      return <Link to={cellData.route()}>{cellData.name()}</Link>;
    };
    return (
      <Table
        rowHeight={30}
        rowGetter={rowGetter}
        rowsCount={count}
        width={width}
        maxHeight={500}
        headerHeight={30}>
        <Column
          label={`${type}: ${count}`}
          cellRenderer={cellRenderer}
          align='left'
          width={width}
          dataKey={0}
          />
      </Table>
    );
  }
}

ProblemList.propTypes = {
  type: Types.string,
  problems: Types.arrayOf(Types.object),
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