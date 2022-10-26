import React, { useState } from 'react'

import "../styles/Header.css"

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

function Header() {

  const [userKey, setUserKey] = useState("");
  const [isUserKeySet, setIsUserKeySet] = useState(false);

  const handleAccessKeyChange = event => {
    setUserKey(event.target.value);
  }

  function setAccessKey() {
    if (userKey.length > 0) {
      sessionStorage.setItem("user-key", userKey);
      setIsUserKeySet(true);
    }
  }

  function resetAccessKey() {
    setUserKey("");
    sessionStorage.removeItem("user-key");
  }

  const sessionUserKey = sessionStorage.getItem("user-key");
  if (sessionUserKey && !isUserKeySet) {
    setUserKey(sessionUserKey);
    setIsUserKeySet(true);
  }

  return (
    <>
      <Navbar bg="primary" variant="dark" className="header">
        <Container>
          <Navbar.Brand href="#">FSE Job Finder</Navbar.Brand>
          {!isUserKeySet &&
            <Form className="d-flex">
              <Form.Control
                type="text"
                placeholder="User Access Key"
                className="me-2"
                aria-label="User Access Key"
                value={userKey || ""}
                onChange={handleAccessKeyChange}
              />
              <Button
                variant="light"
                size="sm"
                className='no-wrap'
                onClick={setAccessKey}>
                Set Access Key
              </Button>
            </Form>
          }
          {isUserKeySet &&
            <>
              <Button
                variant="light"
                size="sm"
                className='no-wrap'
                onClick={() => {
                  resetAccessKey();
                  setIsUserKeySet(false);
                }}>
                Reset Access Key
              </Button>
            </>
          }
        </Container>
      </Navbar>
    </>
  )
}

export default Header;