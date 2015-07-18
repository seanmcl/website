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
const makeFilePath = (problemSetDir, type, problemName) => {
  const kind = problemName.substr(0, 3);
  return type === 'axioms' ?
    `/content/imogen/problems/${problemSetDir}/Axioms/${problemName}.ax` :
    `/content/imogen/problems/${problemSetDir}/Problems/${kind}/${problemName}.p`;
};

/**
 *
 */
const makeFileRoute = (problemSetName, type, problemName) => {
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
  const _file = makeFilePath(problemSetDir, 'problems', _problemName);
  const file = () => _file;
  const name = () => _problemName;
  const size = () => p.size;
  const route = () => _route;
  const matches = rex => _problemName.match(rex);
  return {file, name, size, route, matches};
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
  const _file = makeFilePath(problemSetDir, 'axioms', _problemName);
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
  const dir = () => o.dir;
  const name = () => o.name;
  const axioms = () => _axioms;
  const problems = () => _problems;
  const problem = name => R.find(p => p.name() === name, _problems);
  const axiom = name => R.find(p => p.name() === name, _axioms);
  const problemOrAxiom = (type, name) => type === 'axioms' ? axiom(name) : problem(name);
  return {name, axioms, dir, problems, problemOrAxiom};
})();


/**
 *
 */
const Index = sets => (() => {
  const _obj = sets.reduce((s, o) => R.assoc(o.name, ProblemSet(o), s), {});
  const problemSetNames = () => Object.keys(_obj);
  const hasProblemSet = s => s in _obj;
  const getProblemSet = s => {
    if (hasProblemSet(s)) {
      return _obj[s]
    } else {
      throw new TypeError
    }
  };
  const isEmpty = () => Object.keys(_obj).length === 0;
  return {problemSetNames, getProblemSet, hasProblemSet, isEmpty};
})();


/**
 *
 */
let _state = {
  index: Index([]),
  files: {}
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

    default:
      console.log(`Unknown action: ${action.type}`);
  }
});

export default Store;

/**
 * Expose constructors for unit testing.
 */
export const Test = {Problem, Axiom, ProblemSet, Index};