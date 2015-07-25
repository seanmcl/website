'use strict';

import Dispatcher from '../SiteDispatcher';
import { ActionTypes } from '../SiteConstants';
import { EventEmitter } from 'events';
import { CHANGE_EVENT } from '../Util';
import assign from 'object-assign';

let _store = {
  index: [],
  entries: {}
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
    return _store;
  }
});

Store.dispatchToken = Dispatcher.register(action => {
  switch(action.type) {
    case ActionTypes.BLOG_RECEIVE_INDEX:
      _store.index = action.index;
      Store.emitChange();
      break;

    case ActionTypes.BLOG_RECEIVE_ENTRY:
      _store.entries[action.basename] = action.entry;
      Store.emitChange();
      break;

    default:
      // do nothing
  }
});

export default Store;
