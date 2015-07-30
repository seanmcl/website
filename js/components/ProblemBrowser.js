'use strict';

import $ from 'jquery';
import Highlight from 'highlight.js';
import Marked from 'marked';
import R from 'ramda';
import React from 'react';
import Store from '../stores/ProblemBrowserStore';
import Util from '../Util';
import { Button, ButtonGroup, ButtonToolbar, Col, DropdownButton, Grid, Input,
         MenuItem, Nav, NavItem, Panel, Row } from 'react-bootstrap';
import { ButtonLink, MenuItemLink, NavItemLink } from 'react-router-bootstrap';
import { Column, Table} from 'fixed-data-table';
import { Link } from 'react-router';
import { makeFileRoute } from '../stores/ProblemBrowserStore';
import { PROBLEM_MAX_SIZE,
         getProblemBrowserIndex,
         getProblemBrowserFile } from '../Util';
import { PropTypes as Types } from 'react';
import Select from 'react-select';
import { problemBrowserReceiveSelecteddomains,
         problemBrowserReceiveFilter,
         problemBrowserReceiveSelectedTypes,
         problemBrowserReceiveSelectedStatus } from '../SiteActionCreators';

require('../../node_modules/highlight.js/styles/idea.css');
require('../../node_modules/fixed-data-table/dist/fixed-data-table.css');
require('../../node_modules/react-select/dist/default.css');
require('../../css/default.css');
require('../../css/ProblemBrowser.css');

const MAX_PROBLEMS = 30;
const getStateFromStore = () => Store.get();
const buttonToolbarStyle = {marginRight: 20};
const Style = (() => {
  const sidebarWidth = 165;
  return {
    grid: {
      marginTop: 20
    },
    sidebarWidth: sidebarWidth,
    sidebarButton: {
      width: sidebarWidth,
      minWidth: sidebarWidth,
      marginBottom: 20
    }
  }
})();

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
    const { index, files, selectedDomains, filter, selectedTypes, selectedStatus } = this.state;

    const problemSetNames = index.problemSetNames();
    const defaultProblemSet = () => {
      if (problemSetNames.length > 0) return problemSetNames[0];
      return null;
    };
    problemSet = problemSet || defaultProblemSet();

    const filterRegexp = new RegExp(filter, 'i');
    const problemFilter = p =>
      p.name().match(filterRegexp)
      && (selectedDomains.length === 0
          || R.any(c => p.name().match(c))(selectedDomains))
      && (problemSet != 'TPTP'
          || selectedTypes.length === 0
          || !p.type
          || R.contains(p.type())(selectedTypes))
      && (problemSet != 'TPTP'
      || selectedStatus.length === 0
      || !p.status
      || R.contains(p.status())(selectedStatus));

    const pset = index.getProblemSet(problemSet);
    const domains = pset ? pset.domains() : [];
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
      <ProblemBrowser problems={problems}
                      axioms={axioms}
                      type={type}
                      problem={problem}
                      problemSet={problemSet}
                      problemSetNames={problemSetNames}
                      problemBody={body}
                      domains={domains}
                      selectedDomains={selectedDomains}
                      filter={filter}
                      selectedTypes={selectedTypes}
                      selectedStatus={selectedStatus} />
    );
  }
}

/**
 *
 */
class ProblemBrowser extends React.Component {
  render() {
    const { axioms, problemBody, problem, problems, problemSet,
            problemSetNames, type, domains, selectedDomains, filter,
            selectedTypes, selectedStatus } = this.props;
    const display = type === 'axioms' ? axioms : problems;
    return (
      <Grid style={Style.grid}>
        <Row>
          <Col md={2}>

            <ProblemSetChooser problemSet={problemSet}
                               problemSetNames={problemSetNames}
                               style={Style.sidebarButton} />

            <TypeChooser type={type}
                         hasAxioms={axioms && axioms.length !== 0}
                         problemSet={problemSet}
                         style={Style.sidebarButton} />

            <div style={Style.sidebarButton}>
              <ClassChooser domains={domains}
                            selectedDomains={selectedDomains} />
            </div>

            <div style={Style.sidebarButton}>
              <ProblemTypeChooser selectedTypes={selectedTypes} />
            </div>

            <div style={Style.sidebarButton}>
              <StatusChooser selectedStatus={selectedStatus} />
            </div>

            <ProblemFilter contents={filter}
                           style={Style.sidebarButton} />

            <div style={Style.sidebarButton}>
              <ProblemList problems={display}
                           type={type}
                           selectedDomains={selectedDomains}/>
            </div>

          </Col>
          <Col md={9}>
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
  selectedStatus: Types.arrayOf(Types.string),
  selectedTypes: Types.arrayOf(Types.string),
  type: Types.string,
};


/**
 *
 */
class ProblemSetChooser extends React.Component {
  render() {
    const { problemSet, problemSetNames, style } = this.props;
    return (
        <DropdownButton style={style} title={problemSet}>
          {problemSetNames.map(s =>
            <MenuItemLink key={s} to={`/imogen/problems/${s}`}>
              {s}
            </MenuItemLink>)}
        </DropdownButton>
    );
  }
}

ProblemSetChooser.propTypes = {
  problemSet: Types.string.isRequired,
  problemSetNames: Types.arrayOf(Types.string).isRequired,
  style: Types.object,
};


/**
 *
 */
class TypeChooser extends React.Component {
  render() {
    const { problemSet, type, hasAxioms, style } = this.props;
    if (!problemSet || !hasAxioms) return null;
    const types = ['problems', 'axioms'];
    return (
      <DropdownButton title={type.capitalize()} style={style}>
        {types.map(t =>
            <MenuItemLink key={t}
                          active={type === t}
                          to={`/imogen/problems/${problemSet}/${t}`}>
              {t.capitalize()}
            </MenuItemLink>
        )}
      </DropdownButton>
    );
  }
}

TypeChooser.propTypes = {
  type: Types.string.isRequired,
  problemSet: Types.string.isRequired,
  hasAxioms: Types.bool.isRequired,
  style: Types.object,
};


/**
 *
 */
class ClassChooser extends React.Component {
  render() {
    const { domains, selectedDomains } = this.props;
    const disabled = !domains || domains.length === 0;
    const onChange = (_, cs) => problemBrowserReceiveSelectedDomains(cs.map(c => c.label));
    const options = domains.map(c => ({value: c, label: c}));
    return (
      <Select options={options}
              disabled={disabled}
              placeholder='Domains'
              onChange={onChange}
              value={selectedDomains}
              multi={true} />
    );
  }
}

ClassChooser.propTypes = {
  domains: Types.arrayOf(Types.string).isRequired,
  selectedDomains: Types.arrayOf(Types.string).isRequired,
};


/**
 *
 */
class ProblemFilter extends React.Component {
  render() {
    const { contents, style } = this.props;
    const onChange = () => problemBrowserReceiveFilter(this.refs.input.getValue());
    return (
      <Input type='text'
             style={style}
             value={contents}
             placeholder='Filter'
             ref='input'
             onChange={onChange} />
    );
  }
}

ProblemFilter.propTypes = {
  contents: Types.string.isRequired,
  style: Types.object,
};


/**
 *
 */
class ProblemTypeChooser extends React.Component {
  render() {
    const { selectedTypes } = this.props;
    const types = ['CNF', 'FOF', 'TFA', 'TFF', 'THF'];
    const options = types.map(t => ({value: t, label: t}));
    const onChange = (_, types) => problemBrowserReceiveSelectedTypes(types.map(t => t.label));
    return (
      <Select options={options}
              placeholder='Types'
              onChange={onChange}
              value={selectedTypes}
              multi={true} />
    );
  }
}

ProblemTypeChooser.propTypes = {
  selectedTypes: Types.arrayOf(Types.string).isRequired
};


/**
 *
 */
class StatusChooser extends React.Component {
  render() {
    const { selectedStatus } = this.props;
    const options = [
      {value: 'UNS', label: 'Unsatisfiable'},
      {value: 'SAT', label: 'Satisfiable'},
      {value: 'THM', label: 'Theorem'},
      {value: 'UNK', label: 'Unknown'},
      {value: 'OPN', label: 'Open'},
      {value: 'CSA', label: 'CounterSatisfiable'}
    ];
    const onChange = (_, status) => problemBrowserReceiveSelectedStatus(status.map(s => s.value));
    return (
      <Select options={options}
              placeholder='Status'
              onChange={onChange}
              value={selectedStatus}
              multi={true} />
    );
  }
}

StatusChooser.propTypes = {
  selectedStatus: Types.arrayOf(Types.string).isRequired
};

/**
 *
 */
class ProblemList extends React.Component {
  render() {
    const { problems, type } = this.props;
    if (!problems) return null;
    const rowGetter = n => [problems[n]];
    const count = problems.length;
    //noinspection JSUnusedLocalSymbols
    const cellRenderer = (cellData, cellDataKey, rowData, rowIndex, columnData, width) => {
      return <Link to={cellData.route()}>{cellData.name()}</Link>;
    };
    return (
      <Table rowHeight={30}
             rowGetter={rowGetter}
             rowsCount={count}
             width={Style.sidebarWidth}
             maxHeight={500}
             headerHeight={30}>
        <Column label={`${type}: ${count}`}
                cellRenderer={cellRenderer}
                align='left'
                width={Style.sidebarWidth}
                dataKey={0}/>
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
      //noinspection HtmlUnknownAnchorTarget
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
        <Panel header='Error' bsStyle='danger'>
          Problem is too large to display. ({problem.size()} bytes)
        </Panel>
      );
    }
    if (!body) return <h4>Loading...</h4>;
    return (
      <pre>
        <code className='prolog'>
          {body}
          </code>
      </pre>
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
