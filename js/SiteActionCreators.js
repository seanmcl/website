'use strict';

import Dispatcher from './SiteDispatcher';
import { ActionTypes } from './SiteConstants';

module.exports = {

  receiveQuotes: quotes => Dispatcher.dispatch({
    type: ActionTypes.RECEIVE_QUOTES,
    quotes: quotes
  }),

};
