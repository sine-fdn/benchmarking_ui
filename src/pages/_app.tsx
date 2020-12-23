import { AppProps } from "next/app";

// inject Bulma CSS globally
import "bulma/css/bulma.css";

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
