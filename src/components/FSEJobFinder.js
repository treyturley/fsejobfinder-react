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

  // Todo: find a better way to estimate flight time
  function estimateFlightTime(origin, destination) {

    let flightTime = 0;
    const distance = getDistance(origin, destination);

    flightTime = parseFloat((distance / 370).toFixed(2));

    if (flightTime < 1.0) {
      // roll in extra time for departure/arrival
      flightTime += .4;
    }

    const totalMinutes = flightTime * 60;
    const hours = parseInt(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes.toFixed(0)}m`
  }

  function stringToCurrency(strAmount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(strAmount)
  }
  function generateRouteCards() {
    let row = [];
    if (assignments) {
      assignments.forEach(assignment => {
        row.push(
          <Row key={assignment.id} className='m-1 mb-4'>
            <Col>
              <Card style={{ width: '18rem' }}>
                <Card.Body>
                  <Card.Title>{assignment.fromIcao} to {assignment.toIcao}</Card.Title>
                  <Card.Text>
                    {assignment.amount} {assignment.unitType}
                  </Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush">
                  <ListGroupItem>Pay: {stringToCurrency(assignment.pay)}</ListGroupItem>
                  <ListGroupItem>Distance: {getDistance(assignment.fromIcao, assignment.toIcao)} nm</ListGroupItem>
                  <ListGroupItem>Est. Flight Time: {estimateFlightTime(assignment.fromIcao, assignment.toIcao)}</ListGroupItem>
                </ListGroup>
                <Card.Footer>
                  <a href={`https://server.fseconomy.net/airport.jsp?icao=${assignment.fromIcao}`} target='_blank' rel="noreferrer">Open FSE Airport Page</a>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        );
      });
    }
    return (row);
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
