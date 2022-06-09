import Link from 'next/link'
import Head from 'next/head'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'

export default function App() {    

    return (
        <div className="container">
        <Head>
            <title>Leaderboard example</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
        <br />
        <br />
        <h1>Propel Examples</h1>
        <br />
        <br />
        <br />
        <Container fluid >
            <Row>
                <Col md={4} >
                <Link href="/time-series">
                    <a><h3>Time Series</h3></a>
                </Link>
                </Col>
                <Col md={4} >
                <Link href="/counter">
                    <a><h3>Counter</h3></a>
                </Link>
                </Col>
                <Col md={4} >
                <Link href="/leaderboard">
                    <a><h3>Leaderboard</h3></a>
                </Link>
                </Col>
            </Row>
        </Container>
        <br />
        </main>
        </div>
    )
}