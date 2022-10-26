// Note: open source airport information - https://ourairports.com/data/

import '../styles/FSEJobFinder.css'

import { useState, useEffect } from 'react';

import {
  Container, Row, Col, Dropdown,
  Button, Card, CardGroup, ListGroup, ListGroupItem
} from 'react-bootstrap';

import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';

import axios from 'axios';

function FSEJobFinder() {
  const [aircraft, setAircraft] = useState();
  const [assignments, setAssignments] = useState([]);
  const [aircraftDictionary, setAircraftDictionary] = useState();
  const [airportInfo, setAirportInfo] = useState();
  const [criteria, setCriteria] = useState();
  const [isLoading, setLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [assignmentsRetrieved, setAssignmentsRetrieved] = useState(false);
  const [lastSuccessfulRequest, setLastSuccessfulRequest] = useState(null);

  const API_ENDPOINT = 'https://localhost:7152';
  const API_RESOURCE = '/api/FSEJobFinder';

  const LAT_INDEX = 6;
  const LONG_INDEX = 7;
  // const ELEVATION_INDEX = 8;

  useEffect(() => {
    async function getMakeModels() {
      const url = `${API_ENDPOINT}${API_RESOURCE}/v2/makemodels`;
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

    // Todo: see if there is an api we can use instead of the static airport data
    function getAirportInfo() {
      fetch('../data/Airport_Info.txt')
        .then(r => r.text())
        .then(text => {
          setAirportInfo(text);
        });
    }
    if (!aircraftDictionary) {
      getMakeModels();
    }
    if (!airportInfo) {
      getAirportInfo();
    }
  }, [aircraftDictionary, airportInfo]);

  useEffect(() => {
    async function getAssignments() {
      setIsFirstLoad(false);
      // Todo: check for user key and present error if not found
      const aircraftKey = Object.keys(aircraftDictionary).find(key => aircraftDictionary[key] === aircraft);
      const userKey = sessionStorage.getItem('user-key')
      const url = `${API_ENDPOINT}${API_RESOURCE}/v1${criteria}/${aircraftKey}`;
      try {
        const response = await axios.get(url, {
          headers: {
            'fse-access-key': userKey
          }
        });

        if (response.status === 200) {
          if (Array.isArray(response.data)) {
            setAssignments(response.data);
          } else {
            const result = [];
            result.push(response.data);
            setAssignments(result);
            setLastSuccessfulRequest(Date());
            setAssignmentsRetrieved(true);
          }
          setLoading(false);
        }
        else {
          console.log("response was something other than a 200");
          if (response) {
            console.log(response.status);
            setLoading(false);
            setAssignmentsRetrieved(false);
          }
        }
      } catch (error) {
        if (error.response) {
          console.log(`Status Code: ${error.response.status}`);
          console.log(error.response.data);
          setLoading(false);
          setAssignmentsRetrieved(false);
        } else {
          console.log(error);
          setLoading(false);
          setAssignmentsRetrieved(false);
        }
      }
    }

    if (isLoading) {
      getAssignments();
    }

  }, [isLoading, aircraft, aircraftDictionary, criteria]);

  function handleClick(criteria) {
    setCriteria(criteria);
    setLoading(true);
    setAssignmentsRetrieved(true);
  }

  function rad(x) {
    return x * Math.PI / 180;
  };

  // Haversine formula for calculating great circle distance
  // source: https://stackoverflow.com/questions/1502590/calculate-distance-between-two-points-in-google-maps-v3
  function getDistance(origin, destination) {

    if (airportInfo && airportInfo.length > 0) {

      let originLat = 0;
      let originLong = 0;
      let destinationLat = 0;
      let destinationLong = 0;

      // let originElevation = 0;
      // let destinationElevation = 0;

      const fileLines = airportInfo.split(/\r?\n/);

      fileLines.forEach((line) => {
        if (line.includes("\"" + origin + "\"")) {
          const splitLine = line.split(',');
          originLat = splitLine[LAT_INDEX];
          originLong = splitLine[LONG_INDEX];
          // originElevation = splitLine[ELEVATION_INDEX];
        }
        if (line.includes("\"" + destination + "\"")) {
          const splitLine = line.split(',');
          destinationLat = splitLine[LAT_INDEX];
          destinationLong = splitLine[LONG_INDEX];
          // destinationElevation = splitLine[ELEVATION_INDEX];
        }
      });

      var R = 6378137; // Earth’s mean radius in meter

      var dLat = rad(destinationLat - originLat);
      var dLong = rad(destinationLong - originLong);

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(originLat)) * Math.cos(rad(destinationLat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);

      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      var d = R * c;

      // returns the distance in nautical miles
      return Math.round(d * 0.000539957);
    }
  };

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
      // Todo: is there is a better way to get the key of the first element?
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
      <Row className='mt-4' xs='auto' s='auto'>
        <Col className='mb-2'>
          {/* Todo: implement loading button on click */}
          {/* https://react-bootstrap.github.io/components/buttons/#button-loading-state */}
          <Button
            id='bestAssignment'
            onClick={!isLoading ? () => handleClick('/bestAssignment') : null}
            disabled={isLoading || aircraft == null}
          >
            Best Assignment
          </Button>
        </Col>
        <Col className='mb-2'>
          <Button
            id='assignments'
            onClick={!isLoading ? () => handleClick('/assignments') : null}
            disabled={isLoading || aircraft == null}
          >
            All Assignments
          </Button>
        </Col>
        <Col className='mb-2'>
          <Button
            id='assignmentsFromOrToUS'
            onClick={!isLoading ? () => handleClick('/assignmentsFromOrToUS') : null}
            disabled={isLoading || aircraft == null}
          >
            Assignments to or from the US
          </Button>
        </Col>
      </Row>
      {/* Todo: progress bar when getting assignments?*/}
      <hr />
      {/* {`last request: ${lastSuccessfulRequest.toString()}`} */}
      {isLoading &&
        <h4>Getting Assignments...</h4>
      }
      {!assignmentsRetrieved && !lastSuccessfulRequest && !isFirstLoad &&
        `Unable to get new assignments!`
      }
      {!assignmentsRetrieved && lastSuccessfulRequest &&
        `Unable to get new assignments! Showing old assignments from ${lastSuccessfulRequest.toString()}.`
      }
      {!isLoading &&
        <CardGroup>
          {generateRouteCards()}
        </CardGroup>
      }

    </Container>
  );
}

export default FSEJobFinder;
