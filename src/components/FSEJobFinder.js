// NOTE: import css here when we define css for this component specifically

import { useState, useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';

import '../styles/FSEJobFinder.css'
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import { Button } from 'react-bootstrap';
import axios from 'axios';


function FSEJobFinder() {
  const [aircraft, setAircraft] = useState();

  // const [assignments, setAssignments] = useState();
  const [aircraftDictionary, setAircraftDictionary] = useState();

  const apiEndpoint = 'https://localhost:7152';
  const apiResource = '/api/FSEJobFinder';

  useEffect(() => {
    async function getMakeModels() {
      const url = `${apiEndpoint}${apiResource}/v2/makemodels`;
      try {
        const res = await axios.get(url);
        if (res.status === 200) {
          const makeModelDict = res.data;
          setAircraftDictionary(makeModelDict);
          // Object.entries(makeModelDict).forEach(([key, value]) => {
          //   console.log(`Key: ${key}, Value: ${value}`);
          // });
        }
      } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error);
        }
      }
    }
    getMakeModels();
  }, []);

  async function getAssignments(criteria) {
    console.log("Get Assignments for criteria: " + criteria);
    debugger;
    const url = `${apiEndpoint}${apiResource}/v1/${criteria}/${aircraft}`;
    console.log(url);
    let response = null;
    try {
      response = await axios.get(url);
      if (response.status === 200) {
        console.log(response.data[0].assignments);
      }
    } catch (error) {
      if (response) {
        console.log(`Received error response. Code: ${response.status}.`);
        console.log(response.data);
      }
      console.log(error);
      console.log(error.response.status);
      console.log(error.response.data);
    }
  }

  if (!aircraft) {
    if (aircraftDictionary) {
      // TODO: is there is a better way to get the key of the first element?
      setAircraft(Object.entries(aircraftDictionary)[0][1]);
    }
  }

  return (
    <Container className='app flex-column'>
      <Row className='mt-4' xs='auto'>
        <Col>
          <h2>Select Aircraft: </h2>
        </Col>
        <Col>
          <Dropdown>
            <Dropdown.Toggle variant='primary' id='dropdown-makemodel'>
              {aircraft}
            </Dropdown.Toggle>
            <DropdownMenu>
              {aircraftDictionary &&
                Object.entries(aircraftDictionary).map(([key, value]) => (
                  <DropdownItem key={key} onClick={() => setAircraft(value)}>{value}</DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
        </Col>
        <Col>
          {!aircraftDictionary &&
            <p className='error-text'>Failed to get aircraft!</p>
          }
        </Col>
      </Row>
      <Row className='mt-4' xs='auto'>
        <Col>
          <Button id='bestAssignment' onClick={() => getAssignments('/bestAssignment')}>Best Assignment</Button>
        </Col>
        <Col>
          <Button id='assignments' onClick={() => getAssignments('/assignments')}>All Assignments</Button>
        </Col>
        <Col>
          <Button id='assignmentsFromOrToUS' onClick={() => getAssignments('/assignmentsFromOrToUS')}>Assignments to or from the US</Button>
        </Col>
      </Row>
      <hr />


    </Container>
  );
}

export default FSEJobFinder;
