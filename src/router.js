import React from 'react'
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom'

export const appModules = {
  DEMO: {url: '/index', navTitle: '首页', iocn: 'iconfont icon-zonglan', Component: require('./app/demo') }
}
const AppMs = Object.values(appModules).filter(M => M)

window.Layout.createNavigation({
  'items': AppMs.map(p => ({
    'title': p.navTitle,
    'route': p.url,
    'icon': p.iocn
  }))
})

export default class Bootstrap extends React.PureComponent {
  render () {
    return (
      <HashRouter>
        <Switch>
          <Redirect exact from='/' to={AppMs[0].url} />
          {
            AppMs.map(p => <Route exact key={p.url} path={p.url} component={p.Component} />)
          }
        </Switch>
      </HashRouter>
    )
  }
}
