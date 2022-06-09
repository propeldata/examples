import '../styles/global.css'
import '../styles/bootstrap.min.css'
import SSRProvider from 'react-bootstrap/SSRProvider'

export default function MyApp({ Component, pageProps }) {
    return (
        <SSRProvider>
            <Component {...pageProps} />
        </SSRProvider>
    )
}
