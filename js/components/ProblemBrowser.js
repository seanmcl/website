'use strict';

import React from 'react';
import { PropTypes as Types } from 'react';
import Store from '../stores/ProblemBrowserStore';
import { PROBLEM_MAX_SIZE, getProblemBrowserIndex, getProblemBrowserFile } from '../Util';
import { ButtonGroup, Col, Grid, Input, Nav, NavItem, Row } from 'react-bootstrap';
import { ButtonLink, NavItemLink } from 'react-router-bootstrap';
import { Link } from 'react-router';
import Util from '../Util';
import Marked from 'marked';
import Highlight from 'react-highlight';

require('../../css/idea.css');

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

  _loadFile(props) {
    const { problemSet, type, name } = props.params;
    const { index, files } = this.state;
    const pset = index.getProblemSet(problemSet);
    const problem = pset ? pset.problemOrAxiom(type, name) : null;
    const filename = problem ? problem.file() : null;
    if (filename && !(filename in files) && problem.size() < PROBLEM_MAX_SIZE) {
      getProblemBrowserFile(filename);
    }
  }

  componentWillUpdate() {
    this._loadFile(this.props);
  }

  componentWillReceiveProps(props) {
    this._loadFile(props);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(getStateFromStore());
  }

  render() {
    const { index, files } = this.state;
    const { problemSet, type, name } = this.props.params;
    const pset = index.getProblemSet(problemSet);
    const problem = pset ? pset.problemOrAxiom(type, name) : null;
    const file = problem ? problem.file() : null;
    const body = files[file];
    return <ProblemBrowser index={index}
                           problem={problem}
                           problemSet={problemSet}
                           problemBody={body} />;
  }
}


/**
 *
 */
class ProblemBrowser extends React.Component {
  render() {
    const { index, problem, problemSet, problemBody } = this.props;
    const problems = index.hasProblemSet(problemSet) ? index.getProblemSet(problemSet).problems() : null;
    const axioms = index.hasProblemSet(problemSet) ? index.getProblemSet(problemSet).axioms() : null;
    return (
      <Grid>
        <Row><ProblemSetChooser index={index} /></Row>
        <Row>
          <Col md={9}><ProblemDisplay problem={problem} body={problemBody} /></Col>
          <Col md={3}><ProblemList problems={problems} /></Col>
        </Row>
      </Grid>
    );
  }
}

ProblemBrowser.propTypes = {
  problemSet: Types.string,
  index: Types.object.isRequired,
  problemBody: Types.string,
};

/**
 *
 */
class ProblemDisplay extends React.Component {
  render() {
    const { problem, body } = this.props;
    if (!problem) return <h4>Please select a problem</h4>;
    if (problem.size() > PROBLEM_MAX_SIZE) return <h4>Problem is too large to display.</h4>;
    if (!body) return <h4>Loading...</h4>;
    //const currentRouteName = this.context.router.getCurrentPathname();
    //const axiomToLink = s => currentRouteName.replace(/problems.*/, s.replace(/\\.ax/, ''));
    //const linkBody = body.replace(/)
    return (
      <div style={{fontSize: 16}}>
        <Highlight className='prolog'>
          {body}
        </Highlight>
      </div>
    );
  }
}

ProblemDisplay.propTypes = {
  problem: Types.object.isRequired,
  body: Types.string
};

ProblemDisplay.contextTypes = {
  router: Types.func.isRequired
};

/**
 *
 */
class ProblemSetChooser extends React.Component {
  render() {
    const { index } = this.props;
    const problemSets = index.problemSetNames();
    return (
      <div>
        <Nav bsStyle='pills' activeKey={1}>
          {problemSets.map((s, i) =>
            <NavItemLink key={s} to={`/imogen/problems/${s}`}>
              {s}
            </NavItemLink>)}
        </Nav>
      </div>
    );
  }
}

ProblemSetChooser.propTypes = {
  index: Types.object.isRequired
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
    return (
      <div>
        <span>
          Count: {filteredProblems.length}
          <Input type='text'
                 ref='input'
                 value={this.state.value}
                 placeholder='Filter Problems'
                 onChange={this._handleChange}/>
        </span>
        <ul>
          {filteredProblems.map(p =>
            <li key={p.name()}><Link to={p.route()}>{p.name()}</Link></li>)}
        </ul>
      </div>
    );
  }
}

ProblemList.propTypes = {
  problems: Types.arrayOf(Types.object)
};
