import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { CoordinatesProvider } from './coordinates-context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CoordinatesProvider>
      <Component {...pageProps} />
    </CoordinatesProvider>
  );
}