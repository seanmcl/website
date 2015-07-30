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
import { problemBrowserReceiveSelectedDomains,
         problemBrowserReceiveFilter,
         problemBrowserReceiveDifficulty,
         problemBrowserReceiveEquality,
         problemBrowserReceiveSelectedForms,
         problemBrowserReceiveSelectedStatus } from '../SiteActionCreators';
import objectAssign from 'object-assign';

require('../../node_modules/highlight.js/styles/idea.css');
require('../../node_modules/fixed-data-table/dist/fixed-data-table.css');
require('../../node_modules/react-select/dist/default.css');
require('../../css/default.css');
require('../../css/ProblemBrowser.css');

const MAX_PROBLEMS = 30;
const getStateFromStore = () => Store.get();
const buttonToolbarStyle = {marginRight: 20};
const Style = (() => {
  const sidebarWidth = 160;
  return {
    grid: {
      marginTop: 20
    },
    sidebarWidth: sidebarWidth,
    sidebarButton: {
      float: 'left',
      marginRight: 20,
      //width: sidebarWidth,
      //minWidth: sidebarWidth,
      //marginBottom: 20,
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
    const { index, files, selectedDomains, filter, selectedForms,
            selectedStatus, difficulty, equality } = this.state;
    let { lower, upper } = difficulty;
    lower = lower ? lower : '0.0';
    upper = upper ? upper : '1.0';
    let lowerFloat = parseFloat(lower);
    let upperFloat = parseFloat(upper);
    const epsilon = 0.0001;
    lowerFloat = isNaN(lowerFloat) ? 0.0 : lowerFloat - epsilon;
    upperFloat = isNaN(lowerFloat) ? 1.0 : upperFloat + epsilon;

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
          || selectedForms.length === 0
          || !p.type
          || R.contains(p.type())(selectedForms))
      && (problemSet != 'TPTP'
          || selectedStatus.length === 0
          || !p.status
          || R.contains(p.status())(selectedStatus))
      && (problemSet != 'TPTP'
          || !p.difficulty
          || !$.isNumeric(p.difficulty())
          || (lowerFloat <= p.difficulty() && p.difficulty() <= upperFloat))
      && (!equality
          || !p.hasEquality
          || (equality === 'Some' && p.hasEquality())
          || (equality === 'None' && !p.hasEquality()));

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
                      selectedForms={selectedForms}
                      selectedStatus={selectedStatus}
                      difficulty={difficulty}
                      equality={equality}
        />
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
            selectedForms, selectedStatus, difficulty, equality } = this.props;
    const display = type === 'axioms' ? axioms : problems;
    const isTptp = problemSet == 'TPTP';
    const hasAxioms = axioms && axioms.length !== 0;
    return (
      <Grid style={Style.grid}>
        <Row>
          <Col md={12}>
            <ButtonToolbar>
              <span style={Style.sidebarButton}>
                <ProblemSetChooser problemSet={problemSet}
                                   problemSetNames={problemSetNames} />
              </span>

              <span style={objectAssign({display: hasAxioms ? null : 'none'}, Style.sidebarButton)}>
                <TypeChooser type={type}
                             problemSet={problemSet} />
              </span>

              <span style={Style.sidebarButton}>
                <DomainsChooser domains={domains}
                                selectedDomains={selectedDomains} />
              </span>

              <span style={objectAssign({display: isTptp ? null : 'none'}, Style.sidebarButton)}>
                <FormsChooser selectedForms={selectedForms} />
              </span>

              <span style={objectAssign({display: isTptp ? null : 'none'}, Style.sidebarButton)}>
                  <StatusChooser selectedStatus={selectedStatus} />
              </span>

              <span style={objectAssign({display: isTptp ? null : 'none'}, Style.sidebarButton)}>
                <DifficultyChooser {...difficulty} />
              </span>

              <span style={objectAssign({display: isTptp ? null : 'none'}, Style.sidebarButton)}>
                <EqualityChooser selectedEquality={equality} />
              </span>

              <span id='problem-filter'
                    className='btn-group'
                    style={objectAssign({width: 100}, Style.sidebarButton)}>
                <ProblemFilter contents={filter} />
              </span>
            </ButtonToolbar>
          </Col>
        </Row>

        <Row style={{marginTop: 20}}>
          <Col md={2}>
            <div style={Style.sidebarButton}>
              <ProblemList problems={display}
                           type={type}
                           selectedDomains={selectedDomains}/>
            </div>
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
  difficulty: Types.object,
  problemBody: Types.string,
  problem: Types.object,
  problems: Types.arrayOf(Types.object),
  problemSet: Types.string,
  problemSetNames: Types.arrayOf(Types.string),
  selectedStatus: Types.arrayOf(Types.string),
  selectedForms: Types.arrayOf(Types.string),
  type: Types.string,
};


/**
 *
 */
class ProblemSetChooser extends React.Component {
  render() {
    const { problemSet, problemSetNames } = this.props;
    return (
        <DropdownButton title={problemSet}>
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
};


/**
 *
 */
class TypeChooser extends React.Component {
  render() {
    const { problemSet, type } = this.props;
    const types = ['problems', 'axioms'];
    return (
      <DropdownButton title={type.capitalize()}>
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
  problemSet: Types.string.isRequired
};


/**
 *
 */
class DomainsChooser extends React.Component {
  render() {
    const { domains, selectedDomains } = this.props;
    const disabled = !domains || domains.length === 0;
    const onChange = (_, cs) => problemBrowserReceiveSelectedDomains(cs.map(c => c.label));
    const options = domains.map(c => ({value: c, label: c}));
    return (
      <DropdownButton title='Domains'>
        <Select options={options}
                disabled={disabled}
                placeholder='Any'
                onChange={onChange}
                value={selectedDomains}
                multi={true} />
      </DropdownButton>
    );
  }
}

DomainsChooser.propTypes = {
  domains: Types.arrayOf(Types.string).isRequired,
  selectedDomains: Types.arrayOf(Types.string).isRequired,
};


/**
 *
 */
class FormsChooser extends React.Component {
  render() {
    const { selectedForms } = this.props;
    const forms = ['CNF', 'FOF', 'TFA', 'TFF', 'THF'];
    const options = forms.map(t => ({value: t, label: t}));
    const onChange = (_, forms) => problemBrowserReceiveSelectedForms(forms.map(t => t.label));
    return (
      <DropdownButton title='Forms'>
        <Select options={options}
                placeholder='Any'
                onChange={onChange}
                value={selectedForms}
                multi={true} />
      </DropdownButton>
    );
  }
}

FormsChooser.propTypes = {
  selectedForms: Types.arrayOf(Types.string).isRequired,
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
      <DropdownButton title='Status'>
        <Select options={options}
                placeholder='Any'
                onChange={onChange}
                value={selectedStatus}
                multi={true} />
      </DropdownButton>
    );
  }
}

StatusChooser.propTypes = {
  selectedStatus: Types.arrayOf(Types.string).isRequired,

};


/**
 *
 */
class DifficultyChooser extends React.Component {
  render() {
    const { lower, upper } = this.props;
    const onChange = () => problemBrowserReceiveDifficulty({
        lower: this.refs.lower.getValue(),
        upper: this.refs.upper.getValue()
    });
    return (
      <DropdownButton title='Difficulty'>
        <Input type='text'
               addonBefore='Lower'
               value={lower}
               ref='lower'
               onChange={onChange}/>
        <Input type='text'
               addonBefore='Upper'
               value={upper}
               ref='upper'
               onChange={onChange}/>
      </DropdownButton>
    );
  }
}

DifficultyChooser.propTypes = {
  lower: Types.string.isRequired,
  upper: Types.string.isRequired,
};

/**
 *
 */
class EqualityChooser extends React.Component {
  render() {
    const { selectedEquality } = this.props;
    const options = [
      {value: 'Some', label: 'Some'},
      {value: 'None', label: 'None'},
    ];
    const onChange = s => problemBrowserReceiveEquality(s);
    return (
      <DropdownButton title='Equality'>
        <Select options={options}
                placeholder='Any'
                onChange={onChange}
                value={selectedEquality}
                multi={false} />
      </DropdownButton>
    );
  }
}

EqualityChooser.propTypes = {
  selectedEquality: Types.string,
};


/**
 *
 */
class ProblemFilter extends React.Component {
  render() {
    const { contents } = this.props;
    const onChange = () => problemBrowserReceiveFilter(this.refs.input.getValue());
    return (
      <Input type='text'
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
        <Column label={`${type.capitalize()}: ${count}`}
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
