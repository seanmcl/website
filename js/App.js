'use strict';

import React from 'react';
import Router from 'react-router';
import { Route, RouteHandler, Redirect, HashLocation, HistoryLocation } from 'react-router';
import Blog from './components/Blog';
import Imogen from './components/Imogen';
import Quotes from './components/Quotes';
import Thesis from './components/Thesis';
import Navbar from './components/SiteNavbar';
import ProblemBrowser from './components/ProblemBrowser';
import ProblemStats from './components/ProblemStats';

require('bootstrap-webpack');
require('../css/default.css');

class App extends React.Component {
  render() {
    return (
      <RouteHandler />
    );
  }
}

const routes =
  <Route>
    <Route handler={App}>
      <Route path='blog' handler={Blog}/>
      <Route path='blog/:basename' handler={Blog}/>
      <Route path='imogen' handler={Imogen}/>
      <Route path='imogen/problem-stats' handler={ProblemStats}/>
      <Route path='imogen/problems' handler={ProblemBrowser}/>
      <Route path='imogen/problems/:problemSet' handler={ProblemBrowser}/>
      <Route path='imogen/problems/:problemSet/:type'
             handler={ProblemBrowser}/>
      <Route path='imogen/problems/:problemSet/:type/:name'
             handler={ProblemBrowser}/>
      <Route path='quotes' handler={Quotes}/>
      <Route path='thesis' handler={Thesis}/>
    </Route>
  </Route>;

Router.run(routes, HashLocation, (Handler) => {
  React.render(<Handler/>, document.getElementById('App'));
});
