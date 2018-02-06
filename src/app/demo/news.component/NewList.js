import { List, Avatar, Icon } from 'antd'
import React from 'react'
import Inject from '../../Injectable/Inject'
import NewServers, { As, A1 } from '../news.servers/News'
import Injectable from '../../Injectable/Injectable'
import { Link } from 'react-router-dom'
import NewContext from './NewContext'
import './style.less'

@Injectable()
export default class NewList extends React.Component {
  static displayName = 'NewList'
  @Inject(NewServers) news
  constructor (props) {
    super(props)
    this.state = {
      dataSource: [],
      _id: null
    }
  }
  componentWillMount () {
    const news = this.news.getAllNews()
    this.setState({dataSource: news, _id: news[0]._id})
  }
  render () {
    return (
      <div>
        <List
          itemLayout="horizontal"
          dataSource={this.state.dataSource}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                title={<a onClick={() => this.setState({_id: item._id})}>{item.title}</a>}
                description={item.context}
              />
            </List.Item>
          )}
        />
        <NewContext id={this.state._id}/>
      </div>
    )
  }
}
