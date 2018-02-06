import { List, Avatar, Icon } from 'antd'
import React from 'react'
import Inject from '../../Injectable/Inject';
import NewServers, { As } from '../news.servers/News'
import Injectable from '../../Injectable/Injectable'

@Injectable()
export default class NewContext extends React.Component {
  static displayName = 'NewContext'
  @Inject(NewServers) news
  render () {
    const {title, context} = this.news.getNew(this.props.id)
    return (
      <div>
        <h1>{title}</h1>
        <p>{context}</p>
      </div>
    )
  }
}
