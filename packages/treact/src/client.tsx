import { App } from 'containers'
import { Location } from 'history'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { CircularLoading } from 'respinner'
import routes, { resolveRoute } from 'routes'
import { configureStore } from 'store/store'
import UserSelectedTheme from 'themes/UserSelectedTheme'
import UniversalRouter from 'universal-router'
// TODO: use absolute paths
import history from './history'

let currentRoutes = routes

// TODO: move to another file?
export const store = configureStore()

const renderComponent = (Component: JSX.Element | null) => {
  return ReactDOM.render(
    <AppContainer>
      <Provider store={store} key="provider">
        <UserSelectedTheme>{Component}</UserSelectedTheme>
      </Provider>
    </AppContainer>,
    document.getElementById('app'),
  )
}

const onPersist = () => render(history.location, currentRoutes)
const onHistory = (location: Location) => render(location, currentRoutes)
const init = () => {
  history.listen(onHistory)
  renderComponent(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <CircularLoading size={40} duration={1} stroke="#4197ff" />
    </div>,
  )
  persistStore(
    store,
    {
      whitelist: ['authKey', 'currentUser', 'currentDc', 'selected']
    },
    onPersist,
  )

  console.log(history.location)
}

const render = async (location: Location, Routes: typeof routes) => {
  if (routes) currentRoutes = Routes
  const Router = new UniversalRouter(currentRoutes, {
    resolveRoute,
    context: { store },
  })
  const Route = await Router.resolve<JSX.Element>({
    pathname: location.pathname,
  })
  return renderComponent(<App>{Route}</App>)
}

init()

if (module.hot) {
  module.hot.accept('./app/routes', () => {
    const NewApp: typeof routes = require('./app/routes').default
    render(history.location, NewApp)
  })
}
