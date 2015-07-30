'use strict';

import Dispatcher from '../SiteDispatcher';
import { ActionTypes } from '../SiteConstants';
import { EventEmitter } from 'events';
import { CHANGE_EVENT } from '../Util';
import R from 'ramda';
import assign from 'object-assign';

/**
 * The file
 *     /content/imogen/problems/TPTP-v6.1.0/Problems/AGT/AGT001+1.p'
 * corresponds to route
 *     /imogen/problems/TPTP/Problems/AGT001+1
 */
const makeFilePath = (problemSetDir, type, problemFile) => {
  const kind = problemFile.substr(0, 3);
  return type === 'axioms' ?
    `/content/imogen/problems/${problemSetDir}/Axioms/${problemFile}` :
    `/content/imogen/problems/${problemSetDir}/Problems/${kind}/${problemFile}`;
};

/**
 *
 */
export const makeFileRoute = (problemSetName, type, problemName) => {
  return `/imogen/problems/${problemSetName}/${type}/${problemName}`;
};


/**
 *
 */
const Problem = (problemSetName, problemSetDir) => p => (() => {
  if (!problemSetName || !problemSetDir || !p || !p.file || !p.size) throw new TypeError;
  const _fileName = p.file;
  const _problemName = _fileName.replace(/\.[^\.]*$/, '');
  const _route = makeFileRoute(problemSetName, 'problems', _problemName);
  const _file = makeFilePath(problemSetDir, 'problems', _fileName);
  const file = () => _file;
  const name = () => _problemName;
  const size = () => p.size;
  const route = () => _route;
  const matches = rex => _problemName.match(rex);
  const stats = () => p.stats;
  const type = () => {
    switch (name()[6]) {
      case '-': return 'CNF';
      case '+': return 'FOF';
      case '_': return 'TFF';
      case '=': return 'TFA';
      case '^': return 'THF';
      default: throw `Unknown type: ${name()}}`;
    }
  };
  const status = () => p.stats && p.stats.length >= 2 ? p.stats[2] : null;
  return {file, name, size, route, matches, stats, type, status};
})();


/**
 * The file
 *     content/imogen/problems/TPTP-v6.1.0/Axioms/AGT001+1.ax
 * corresponds to route
 *     imogen/problems/TPTP/Axioms/AGT001+1
 */
const Axiom = (problemSetName, problemSetDir) => p => (() => {
  if (!problemSetName || !problemSetDir || !p || !p.file || !p.size) throw new TypeError;
  const _fileName = p.file;
  const _problemName = _fileName.replace(/\.[^\.]*$/, '');
  const _route = makeFileRoute(problemSetName, 'axioms', _problemName);
  const _file = makeFilePath(problemSetDir, 'axioms', _fileName);
  const file = () => _file;
  const name = () => _problemName;
  const size = () => p.size;
  const route = () => _route;
  const matches = rex => _problemName.match(rex);
  return {file, name, size, route, matches};
})();


/**
 *
 */
const ProblemSet = o => (() => {
  if (!o.dir || !o.axioms || !o.problems) throw new TypeError;
  const _axioms = o.axioms.map(Axiom(o.name, o.dir));
  const _problems = o.problems.map(Problem(o.name, o.dir));
  const _domains = R.uniq(_problems.map(p => p.name().substr(0, 3)));
  const dir = () => o.dir;
  const name = () => o.name;
  const axioms = () => _axioms;
  const problems = () => _problems;
  const problem = name => R.find(p => p.name() === name)(_problems);
  const axiom = name => R.find(p => p.name() === name)(_axioms);
  const hasStats = () => o.hasStats;
  const domains = () => _domains;
  const problemOrAxiom = (type, name) => type === 'axioms' ? axiom(name) : problem(name);
  return {name, axioms, dir, problems, problemOrAxiom, domains, hasStats};
})();


/**
 *
 */
const Index = sets => (() => {
  const _obj = sets.reduce((s, o) => R.assoc(o.name, ProblemSet(o), s), {});
  const problemSetNames = () => Object.keys(_obj);
  const hasProblemSet = s => s in _obj;
  const getProblemSet = s => _obj[s] || null;
  const isEmpty = () => Object.keys(_obj).length === 0;
  return {problemSetNames, getProblemSet, hasProblemSet, isEmpty};
})();


/**
 *
 */
let _state = {
  index: Index([]),
  files: {},
  selectedDomains: [],
  filter: '',
  selectedTypes: [],
  selectedStatus: []
};

const Store = assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  get() {
    return _state;
  }
});

Store.dispatchToken = Dispatcher.register(action => {
  switch(action.type) {
    case ActionTypes.PROBLEM_BROWSER_RECEIVE_INDEX:
      console.log('Received Index');
      _state.index = Index(action.index);
      Store.emitChange();
      break;

    case ActionTypes.PROBLEM_BROWSER_RECEIVE_FILE:
      console.log(`Received file: ${action.name}`);
      _state.files[action.name] = action.file;
      Store.emitChange();
      break;

    case ActionTypes.PROBLEM_BROWSER_RECEIVE_SELECTED_DOMAINS:
      console.log(`Received domains: ${action.domains}`);
      _state.selectedDomains = action.domains.sort();
      Store.emitChange();
      break;

    case ActionTypes.PROBLEM_BROWSER_RECEIVE_FILTER:
      console.log(`Received filter: ${action.filter}`);
      _state.filter = action.filter;
      Store.emitChange();
      break;

    case ActionTypes.PROBLEM_BROWSER_RECEIVE_SELECTED_TYPES:
      console.log(`Received types: ${action.types}`);
      _state.selectedTypes = action.types.sort();
      Store.emitChange();
      break;

    case ActionTypes.PROBLEM_BROWSER_RECEIVE_SELECTED_STATUS:
      console.log(`Received status: ${action.status}`);
      _state.selectedStatus = action.status.sort();
      Store.emitChange();
      break;

    default:
      // do nothing
  }
});

export default Store;

/**
 * Expose constructors for unit testing.
 */
export const Test = {Problem, Axiom, ProblemSet, Index};
