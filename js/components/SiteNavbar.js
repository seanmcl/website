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
      <div>
        <Navbar className='navbar'>
          <Nav bsStyle='pills'>
            <NavItemLink to='/blog'>Blog</NavItemLink>
            <NavItemLink to='/quotes'>Quotes</NavItemLink>
            <NavItemLink to='/imogen'>Imogen</NavItemLink>
          <NavItemLink to='/thesis'>Thesis</NavItemLink>
          </Nav>
        </Navbar>
      </div>
    );
  }
}
