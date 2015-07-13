'use strict';

import React from 'react';
import { Navbar, Nav, NavItem, DropdownButton, MenuItem } from 'react-bootstrap';
import { MenuItemLink, NavItemLink } from 'react-router-bootstrap';

/**
 *
 */
export default class SiteNavbar extends React.Component {
  render() {
    return (
      <Navbar className='navbar navbar-inverse' brand='Home'>
        <Nav bsStyle="pills">
          <NavItemLink to='/quotes'>Quotes</NavItemLink>
          <NavItemLink to='/thesis'>Thesis</NavItemLink>
        </Nav>
      </Navbar>
    );
  }
}
