'use strict';

import keymirror from 'keymirror';

module.exports = {

  ActionTypes: keymirror({
    THESIS_RECEIVE_PAGES: null,
    QUOTES_RECEIVE_QUOTES: null,
    BLOG_RECEIVE_INDEX: null,
    BLOG_RECEIVE_ENTRY: null,

    PROBLEM_BROWSER_RECEIVE_INDEX: null,
    PROBLEM_BROWSER_RECEIVE_FILE: null,
    PROBLEM_BROWSER_RECEIVE_SELECTED_DOMAINS: null,
    PROBLEM_BROWSER_RECEIVE_FILTER: null,
    PROBLEM_BROWSER_RECEIVE_SELECTED_TYPES: null,
    PROBLEM_BROWSER_RECEIVE_SELECTED_STATUS: null,
  })

};
