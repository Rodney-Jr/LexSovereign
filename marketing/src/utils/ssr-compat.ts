import {
    Link,
    useLocation,
    BrowserRouter,
    Routes,
    Route
} from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// StaticRouter and MemoryRouter might be in react-router directly in v7
import * as RouterPkg from 'react-router';
const RouterPkgAny = RouterPkg as any;
const StaticRouter = RouterPkgAny.StaticRouter || RouterPkgAny.ServerRouter;
const MemoryRouter = RouterPkgAny.MemoryRouter;

export {
    Link,
    useLocation,
    BrowserRouter,
    Routes,
    Route,
    StaticRouter,
    MemoryRouter,
    Helmet,
    HelmetProvider
};
