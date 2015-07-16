'use strict';

import Dispatcher from './SiteDispatcher';
import { ActionTypes } from './SiteConstants';

module.exports = {

  quotesReceiveQuotes: quotes => {
    Dispatcher.dispatch({
      type: ActionTypes.QUOTES_RECEIVE_QUOTES,
      quotes: quotes
    })
  },

  thesisReceivePages: pages => Dispatcher.dispatch({
    type: ActionTypes.THESIS_RECEIVE_PAGES,
    pages: pages
  }),

  blogReceiveIndex: index => Dispatcher.dispatch({
    type: ActionTypes.BLOG_RECEIVE_INDEX,
    index: index
  }),

  blogReceiveEntry: basename => entry => Dispatcher.dispatch({
    type: ActionTypes.BLOG_RECEIVE_ENTRY,
    basename: basename,
    entry: entry
  }),

};
