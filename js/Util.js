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
const parseJsonOrJsonArray = s => {
  try {
    return JSON.parse(s);
  } catch (_) {
    try {
      const res = JSON.parse(`[${s.trim().replace(/\n/g, ',')}]`);
      return res
    } catch (_) {
      throw `Can't parse as JSON: ${s}`;
    }
  }
};

/**
 *
 */
const getJsonOrJsonArray = (url, success) => {
  const success1 = text =>
    success(parseJsonOrJsonArray(text));
  return $.ajax({dataType: "text", url}).success(success1).error(logError);
};

/**
 *
 */
export const getQuotes = () =>
  getJsonOrJsonArray(`/content/quotes/quotes.json`, Actions.quotesReceiveQuotes);

/**
 *
 */
export const getThesisPages = () =>
  getJsonOrJsonArray(`/content/thesis/pages.json`, Actions.thesisReceivePages);
