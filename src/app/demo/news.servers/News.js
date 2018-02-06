import Injectable from "../../Injectable/Injectable"
import Inject from "../../Injectable/Inject";

// 文章服务
let id = 0
class New {
  avatar = 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  title = ''
  context = ''
  constructor (title, context) {
    this._id = `_id-${id++}`
    this.title = title
    this.context = context
  }
}

const data = [
  new New('习近平会见来京述职的林郑月娥', '国家主席习近平15日下午在中南海瀛台会见了来京述职的香港特别行政区行政长官林郑月娥，听取了她对香港当前形势和特别行政区政府工作情况的汇报'),
  new New('侠客岛：最高领导人会见港澳特首，有个重要表述', '15日，习近平在中南海分别会见了来京述职的香港、澳门特别行政区行政长官林郑月娥和崔世安。习近平对香港和澳门积极学习十九大精神的做法表示肯定。值得注意的是，习近平再次用“特别行政区政府管治团队”来称呼林郑月娥和崔世安带领的施政团队')
]

export class A1 {
  constructor () {
    console.log('执行A1')
  }
}

@Injectable()
export class B {
  @Inject('A1') a1
  constructor () {
    console.log('A', this.a1)
  }
}

@Injectable()
export class A {
  @Inject('A1') a1
  constructor () {
    console.log('A', this.a1)
  }
}

@Injectable()
export default class NewServers {
  static news = {}

  @Inject(A) a
  // @Inject('A1') a1
  constructor () {
    // console.log('NewServers1111', this.a1)
    // console.log('A1', this.a1)
  }
  getAllNews () {
    data.forEach( d => (NewServers.news[d._id] = d))
    return data
  }
  getNew (_id) {
    return NewServers.news[_id] || {}
  }
}
