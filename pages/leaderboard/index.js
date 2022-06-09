import Link from 'next/link'
import Head from 'next/head'
import { GraphQLClient, request, gql } from 'graphql-request'
import { ClientCredentials } from 'simple-oauth2'
import Dropdown from 'react-bootstrap/Dropdown'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function SSR({ propelData }) {
    console.log('propelData', propelData)
    const { query } = useRouter()
    let timeRange = ''
    if (query.timeRange) {
        timeRange = query.timeRange
    } else {
        timeRange = 'YESTERDAY'
    }
    let timeRangeText = timeRange.replace(/_/g, ' ')

    // Destructure leaderboard data out of the propelData object (from props):
    const { headers, rows } = propelData.metricByName.leaderboard
    // Make a helper function to format the header from PRODUCT_CATEGORY to Product Category:
    const formatHeader = (header) =>
        header
            .split('_')
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1).toLocaleLowerCase(),
            )
            .join(' ')
    // Prepare to format the leaderboard value data as US Dollars, without cents:
    const formatOptions = {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }
    // Grab the Intl.NumberFormat helper to format numbers with commas:
    const internationalNumberFormat = new Intl.NumberFormat(
        'en-us',
        formatOptions,
    )
    // Destructure the format function from the Intl.NumberFormat helper:
    const { format } = internationalNumberFormat
    // Make a helper function to format the value data (column index 1) with commas as USD:
    const formatDollars = format

    return (
        <div className="container">
            <Head>
                <title>Leaderboard example</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <h1>Leaderboard example</h1>
                <Container fluid>
                    <Row style={{ padding: 5 }}>
                        <Col
                            md={6}
                            style={{
                                display: 'flex',
                                justifyContent: 'left',
                                padding: 10,
                                backgroundColor: '#464646',
                            }}
                        ></Col>
                        <Col
                            md={6}
                            style={{
                                display: 'flex',
                                justifyContent: 'right',
                                padding: 10,
                                backgroundColor: '#464646',
                            }}
                        >
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="light"
                                    id="dropdown-basic"
                                    size="sm"
                                >
                                    {timeRangeText}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="/leaderboard?timeRange=YESTERDAY">
                                        Yesterday
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/leaderboard?timeRange=LAST_7_DAYS">
                                        Last 7 days
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/leaderboard?timeRange=LAST_30_DAYS">
                                        Last 30 days
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/leaderboard?timeRange=LAST_90_DAYS">
                                        Last 90 days
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/leaderboard?timeRange=THIS_YEAR">
                                        This year
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/leaderboard?timeRange=LAST_YEAR">
                                        Last year
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/leaderboard?timeRange=LAST_2_YEARS">
                                        Last 2 years
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <br />
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        {headers.map((header) => (
                                            <th key={header}>
                                                {header === 'value'
                                                    ? 'Category Sales'
                                                    : formatHeader(header)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Loop through the rows and create a row for each one: */}
                                    {rows[0].map((_, index) => (
                                        <tr
                                            key={`${rows[0][index]}${rows[1][index]}${index}`}
                                        >
                                            <td>{index + 1}</td>
                                            {/* Access each column directly and create a cell for each data point: */}
                                            <td>{rows[0][index]}</td>
                                            <td>
                                                {formatDollars(rows[1][index])}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Container>
                <br />
                <br />
                <Container fluid>
                    <Row>
                        <Col md={12}>
                            <Link href="/">
                                <a href="/">
                                    <h3>&larr; Back to home</h3>
                                </a>
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </main>
        </div>
    )
}

export async function getServerSideProps(context) {
    //Set the query

    const leaderboardQuery = gql`
        query timeSeries(
            $uniqueName: String!
            $timeRange: TimeRangeInput!
            $rowLimit: Int!
            $sort: Sort
            $dimensions: [DimensionInput!]!
        ) {
            metricByName(uniqueName: $uniqueName) {
                leaderboard: leaderboard(
                    input: {
                        timeRange: $timeRange
                        rowLimit: $rowLimit
                        sort: $sort
                        dimensions: $dimensions
                    }
                ) {
                    headers
                    rows
                }
            }
        }
    `

    const variables = {
        uniqueName: 'sales',
        timeRange: {
            relative: context.query.timeRange || 'YESTERDAY',
        },
        rowLimit: 10,
        sort: 'DESC',
        dimensions: [
            {
                columnName: 'PRODUCT_CATEGORY',
            },
        ],
    }

    // Set the config for the OAuth2 client
    const config = {
        client: {
            id: process.env.CLIENT_ID_SAMPLE_APP,
            secret: process.env.CLIENT_SECRET_SAMPLE_APP,
        },
        auth: {
            tokenHost: process.env.TOKEN_HOST,
            tokenPath: process.env.TOKEN_PATH,
        },
    }

    // Create the OAuth2 client
    const oauth2Client = new ClientCredentials(config)

    // Get a token using the client credentials
    const accessToken = await oauth2Client.getToken()

    // Create a GraphQL client
    const client = new GraphQLClient(
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT_US_EAST_2,
    )

    client.setHeader(
        'authorization',
        'Bearer ' + accessToken.token.access_token,
    )
    const data = await client.request(timeSeriesQuery, variables)

    return {
        props: {
            propelData: data,
        },
    }
}
