import Link from 'next/link'
import Head from 'next/head'
import { GraphQLClient, request, gql } from 'graphql-request'
import { ClientCredentials } from 'simple-oauth2'
import Dropdown from 'react-bootstrap/Dropdown'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useRouter } from 'next/router'

export default function SSR({ propelData }) {
    const { query } = useRouter()
    let timeRange = ''
    let comparisonTimeRange = ''
    if (query.timeRange) {
        timeRange = query.timeRange
        comparisonTimeRange = query.comparisonTimeRange
    } else {
        timeRange = 'TODAY'
        comparisonTimeRange = 'YESTERDAY'
    }
    let timeRangeText = timeRange.replace(/_/g, ' ')

    // Prepare to format the counter data as US Dollars, without cents:
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
    // Format the numbers from our propelData object (passed in via props):
    const mainCounter = propelData.metricByName.mainCounter.value
    const comparisonCounter = propelData.metricByName.comparisonCounter.value
    const mainCounterUSD = format(mainCounter)
    const comparisonCounterUSD = format(comparisonCounter)
    const decimalDifference = (mainCounter - comparisonCounter) / mainCounter
    // Round to 2 digits of precision and add a + sign for positive values: +/-19.99%
    const percentDifference = `${decimalDifference > 0 ? '+' : ''}${
        Math.round(10000 * decimalDifference) / 100
    }`
    // Choose the text color for the percentage difference, red for negative, green for positive:
    const color = decimalDifference > 0 ? 'green' : 'red'

    return (
        <div className="container">
            <Head>
                <title>Counter example</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <h1>Counter example</h1>
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
                                    <Dropdown.Item href="/counter?timeRange=TODAY&comparisonTimeRange=YESTERDAY">
                                        Today
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/counter?timeRange=THIS_WEEK&comparisonTimeRange=PREVIOUS_WEEK">
                                        This Week
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/counter?timeRange=THIS_MONTH&comparisonTimeRange=PREVIOUS_MONTH">
                                        This Month
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/counter?timeRange=THIS_YEAR&comparisonTimeRange=PREVIOUS_YEAR">
                                        This Year
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} style={{ justifyContent: 'center' }}>
                            <br />
                            {comparisonTimeRange}
                        </Col>
                        <Col md={6} style={{ justifyContent: 'center' }}>
                            <br />
                            {timeRange}
                        </Col>
                    </Row>
                    <Row style={{ justifyContent: 'center' }}>
                        <Col md={6}>
                            <br />
                            {comparisonCounterUSD}
                        </Col>
                        <Col md={6}>
                            <br />
                            {mainCounterUSD}{' '}
                            <b style={{ color }}>({percentDifference}%)</b>
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

    const counterQuery = gql`
        query timeSeries(
            $uniqueName: String!
            $timeRange: TimeRangeInput!
            $comparisonTimeRange: TimeRangeInput!
        ) {
            metricByName(uniqueName: $uniqueName) {
                mainCounter: counter(input: { timeRange: $timeRange }) {
                    value
                }
                comparisonCounter: counter(
                    input: { timeRange: $comparisonTimeRange }
                ) {
                    value
                }
            }
        }
    `

    const variables = {
        uniqueName: 'sales',
        timeRange: {
            relative: context.query.timeRange || 'TODAY',
        },
        comparisonTimeRange: {
            relative: context.query.comparisonTimeRange || 'YESTERDAY',
        },
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
    const tokenParams = {
        scope: '<scope>',
    }

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
