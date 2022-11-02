import Link from 'next/link'
import Head from 'next/head'
import { GraphQLClient, gql } from 'graphql-request'
import { ClientCredentials } from 'simple-oauth2'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import Dropdown from 'react-bootstrap/Dropdown'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useRouter } from 'next/router'
import { TimeSeriesQuery, getTimeSeriesVariables } from './TimeSeriesQuery'

export default function SSR({ propelData }) {
    const { query } = useRouter()
    let timeRange = ''
    if (query.timeRange) {
        timeRange = query.timeRange
    } else {
        timeRange = 'LAST_30_DAYS'
    }
    let timeRangeText = timeRange.replace(/_/g, ' ')
    const options = {
        xAxis: {
            type: 'category',
            data: propelData.timeSeries.labels,
            axisLabel: {
                rotate: 30,
                formatter: function (value) {
                    return echarts.format.formatTime('yyyy-MM-dd', value)
                    //return echarts.time.format('yyyy-MM-dd', value);
                },
            },
            axisTick: {
                alignWithLabel: true,
            },
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                name: 'Values',
                type: 'bar',
                barWidth: '85%',
                data: propelData.timeSeries.values,
                stack: propelData.timeSeries.labels,
                color: '#62B0E8',
            },
        ],
        tooltip: {
            trigger: 'axis',
        },
    }
    return (
        <div className="container">
            <Head>
                <title>Time Series example</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <br />
                <br />
                <h1>Time series example</h1>
                <br />
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
                                    <Dropdown.Item href="/time-series?timeRange=TODAY&granularity=MINUTE">
                                        Today
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/time-series?timeRange=LAST_7_DAYS&granularity=HOUR">
                                        Last 7 days
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/time-series?timeRange=LAST_30_DAYS&granularity=DAY">
                                        Last 30 days
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/time-series?timeRange=LAST_90_DAYS&granularity=DAY">
                                        Last 90 days
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/time-series?timeRange=THIS_YEAR&granularity=DAY">
                                        This year
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/time-series?timeRange=LAST_YEAR&granularity=DAY">
                                        Last year
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/time-series?timeRange=LAST_2_YEARS&granularity=MONTH">
                                        Last 2 years
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <br />
                            <ReactECharts option={options} />
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
    //Set the query variables
    const { timeRange, granularity } = context.query
    const variables = getTimeSeriesVariables({ timeRange, granularity })

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
    const data = await client.request(TimeSeriesQuery, variables)

    return {
        props: {
            propelData: data.metricByName,
        },
    }
}
