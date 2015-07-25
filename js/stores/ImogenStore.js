'use strict';

import Dispatcher from '../SiteDispatcher';
import { ActionTypes } from '../SiteConstants';
import { EventEmitter } from 'events';
import { CHANGE_EVENT } from '../Util';
import assign from 'object-assign';

let _state = {
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
    //case ActionTypes.THESIS_RECEIVE_PAGES:
    //  _state.pages = action.pages;
    //  Store.emitChange();
    //  break;

    default:
      // do nothing
  }
});

export default Store;
