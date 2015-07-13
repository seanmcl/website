'use strict';

import $ from 'jquery';
import Actions from './SiteActionCreators';

const logError = e => console.log(e);

export const CHANGE_EVENT = 'change';

/**
 *
 */
export const hashString = str => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};


/**
 *
 */
export const parseJsonOrJsonList = s => {
  try {
    return JSON.parse(s);
  } catch (_) {
    try {
      return JSON.parse(`[${s.trim().replace(/\n/g, ',')}]`);
    } catch (_) {
      throw `Can't parse as JSON: ${s}`;
    }
  }
};


/**
 *
 */
export const getQuotes = () =>
  $.getJSON(`/content/quotes/quotes.json`, Actions.receiveQuotes).error(logError);
