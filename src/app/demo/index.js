import React from 'react'
import PropTypes from 'prop-types'
import Injectable from '../Injectable/Injectable'
import Inject from '../Injectable/Inject'
import NewList from './news.component/NewList'
import NewContext from './news.component/NewContext'
import NewServers, { As, A, A1, B } from './news.servers/News'

@Injectable()
export default class MessageList extends React.Component {
  static displayName = 'MessageList'
  static providers = [
    A,
    {provide: NewServers, useClass: NewServers},
    {provide: 'A1', useClass: A1}
  ]
  // @Inject('A1') a1
  constructor () {
    super()
    // console.log('MessageList', this.a1)
  }
  render () {
    return (
      <div>
        <NewList />
        <NewContext/>
      </div>
    )
  }
}
