import React from 'react'

import "../styles/Header.css"

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function Header() {
  return (
    <>
      <Navbar bg="primary" variant="dark" className="header">
        <Container>
          <Navbar.Brand href="#">FSE Job Finder</Navbar.Brand>
        </Container>
      </Navbar>
    </>
  )
}

export default Header;