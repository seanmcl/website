'use strict';

import Dispatcher from './SiteDispatcher';
import { ActionTypes } from './SiteConstants';


module.exports = {

  quotesReceiveQuotes: quotes => {
    Dispatcher.dispatch({
      type: ActionTypes.QUOTES_RECEIVE_QUOTES,
      quotes
    })
  },

  thesisReceivePages: pages => Dispatcher.dispatch({
    type: ActionTypes.THESIS_RECEIVE_PAGES,
    pages
  }),

  blogReceiveIndex: index => Dispatcher.dispatch({
    type: ActionTypes.BLOG_RECEIVE_INDEX,
    index
  }),

  blogReceiveEntry: basename => entry => Dispatcher.dispatch({
    type: ActionTypes.BLOG_RECEIVE_ENTRY,
    basename,
    entry
  }),

  problemBrowserReceiveIndex: index => Dispatcher.dispatch({
    type: ActionTypes.PROBLEM_BROWSER_RECEIVE_INDEX,
    index,
  }),

  problemBrowserReceiveFile: name => file => Dispatcher.dispatch({
    type: ActionTypes.PROBLEM_BROWSER_RECEIVE_FILE,
    name,
    file,
  }),

  problemBrowserReceiveSelectedDomains: domains => Dispatcher.dispatch({
    type: ActionTypes.PROBLEM_BROWSER_RECEIVE_SELECTED_DOMAINS,
    domains,
  }),

  problemBrowserReceiveFilter: filter => Dispatcher.dispatch({
    type: ActionTypes.PROBLEM_BROWSER_RECEIVE_FILTER,
    filter,
  }),

  problemBrowserReceiveSelectedTypes: types => Dispatcher.dispatch({
    type: ActionTypes.PROBLEM_BROWSER_RECEIVE_SELECTED_TYPES,
    types,
  }),

  problemBrowserReceiveSelectedStatus: status => Dispatcher.dispatch({
    type: ActionTypes.PROBLEM_BROWSER_RECEIVE_SELECTED_STATUS,
    status,
  }),

};
