# 为什么要依赖注入
#### 关于什么是依赖注入，在Stack Overflow上面有一个问题，如何向一个5岁的小孩解释依赖注入，其中得分最高的一个答案是：

当你把东西从冰箱里拿出来的时候，你可能会引起问题。你可能会把门打开，你可能会得到一些妈妈或爸爸不希望你拥有的东西。你甚至可能在寻找我们甚至没有的东西，或者已经过期的东西。

你应该做的是陈述一种需求:“午餐时我需要喝点东西”，然后在你坐下吃饭的时候，我们会确保你有东西吃。

#### 映射到面向对象程序开发

- 传统的代码，每个对象负责管理与自己需要依赖的对象，导致如果需要切换依赖对象的实现类时，需要修改多处地方。同时，过度耦合也使得对象难以进行单元测试。

- 依赖注入把对象的创造交给外部去管理,很好的解决了代码紧耦合（tight couple）的问题，是一种让代码实现松耦合（loose couple）的机制。

- 松耦合让代码更具灵活性，能更好地应对需求变动，以及方便单元测试。

依赖注入不是目的，它是一系列工具和手段，最终的目的是帮助我们开发出松散耦合(loose coupled)、可维护、可测试的代码和程序。这条原则的做法是大家熟知的面向接口，或者说是面向抽象编程。

[!用小说的形式讲解为什么需要依赖注入](https://zhuanlan.zhihu.com/p/29426019)

# 在组件中注册提供商
在react中我们供应商通过组件`context`上下文去传递的。建议我们在模块顶层组件去配置我们的供应商，当然我们组件也存在自己独有的供应商，那么自己独有供应商只会作用于自己组件以及它的子组件， 接下来我们看一下具体的代码:

1. 我们导入一个新闻`NewServers`服务
2. 将新闻`NewServers`服务加入到组件的静态属性providers中，这样我们就配置好了我们的供应商了
3. 接下来我们使用`@Inject(NewServers) news`装饰器把新闻`NewServers`服务注入到，组件的内部变量上去

src/app/news/news.servers.js
```js
import Injectable from '../Injectable/Injectable'
export default class NewServers {
  getNews () {
    return [{
      title: '习近平会见来京述职的林郑月娥'
      context: '国家主席习近平15日下午在中南海瀛台会见了来京述职的香港特别行政区行政长官林郑月娥，听取了她对香港当前形势和特别行政区政府工作情况的汇报'
    }]
  }
}
```

src/app/news/index.js
```js
import React from 'react'
import PropTypes from 'prop-types'
import Injectable from '../Injectable/Injectable'
import Inject from '../Injectable/Inject'
import NewList from './news.component/NewList'
import NewServers from './news.servers'

@Injectable()
export default class MessageList extends React.Component {
  static displayName = 'MessageList'
  static providers = [ // 提供供应商
    {provide: 'NewServers', useClass: NewServers}, 
  ]
  render () {
    return (
      <div>
        <NewList />
        <NewContext/>
      </div>
    )
  }
}

```
src/app/news/NewsList.component.js
```js

import Injectable from '../Injectable/Injectable'
import React from 'react'
import PropTypes from 'prop-types'

@Injectable()
export default class NewList extends React.Component {
  static displayName = 'NewList'
  @Inject('NewServers') news 
  constructor () {
    super()
    console.log('NewList', this.news)
  }
  render () {
    return (
      <div>NewList </div>
    )
  }
}
```

# 单例服务
在一个注入器的范围内，依赖都是单例的。 在这个例子中，`MessageList`和它的子组件`NewList`共享同一个`NewServers`实例。

然而，我们是通过`context`传递供应商所以是一个分层的依赖注入系统，这意味着嵌套的注入器可以创建它们自己的服务实例

# 当服务需要别的服务时

这个NewServers非常简单。它本身不需要任何依赖。

如果它也有依赖，该怎么办呢？例如，获取新闻列表的时候需要请求一个是否登陆，权限的服务

src/app/news/user.servers.js
```js
import Injectable from '../Injectable/Injectable'
export default class UserServers {
  getUserToken () {
    return 'uuid'
  }
}
```

src/app/news/index.js
```js
import UserServers from './UserServers'
// 供应商中加入
static providers = [ // 提供供应商
  {provide: UserServers, useClass: UserServers}, 
  {provide: 'NewServers', useClass: NewServers}, 
]
```

src/app/news/news.servers.js
```js
import Injectable from '../Injectable/Injectable'
import UserServers from './UserServers'
import Inject from '../Injectable/Inject'

export default class NewServers {
  @Inject(UserServers) user
  constructor () {
    super()
    console.log('NewServers', this.user)
  }
  getNews () {
    return [{
      title: '习近平会见来京述职的林郑月娥'
      context: '国家主席习近平15日下午在中南海瀛台会见了来京述职的香港特别行政区行政长官林郑月娥，听取了她对香港当前形势和特别行政区政府工作情况的汇报'
    }]
  }
}
```

# 为什么要用 @Injectable()?
`@Injectable()` 标识一个类可以被注入器实例化。 通常，在试图实例化没有被标识为@Injectable()的类时，注入器会报错。

#### 建议为每个服务类都添加@Injectable()，包括那些没有依赖严格来说并不需要它的。因为：
  - 面向未来: 没有必要记得在后来添加依赖的时候添加 @Injectable()。
  - 一致性:所有的服务都遵循同样的规则，不需要考虑为什么某个地方少了一个。

> 别忘了带括号! 总是使用@Injectable()的形式，不能只用@Injectable。 如果忘了括号，应用就会神不知鬼不觉的失败！

# 注入器的提供商们
提供商提供依赖值的一个具体的、运行时的版本。 注入器依靠提供商创建服务的实例，注入器再将服务的实例注入组件或其它服务。

每一个组件都可以有它自己的提供商！作用于自己以及它的子类。

必须为注入器注册一个服务的提供商，否则它不知道该如何创建该服务。

我们在前面通过 在组件中定义 `static providers` ,以对象字面量的方式注册提供商

src/app/news/index.js
```js
import UserServers from './UserServers'
// 供应商中加入
static providers = [ // 提供供应商
  {provide: UserServers, useClass: UserServers}, 
  {provide: 'NewServers', useClass: NewServers}, 
]
```

## 注入器树

组件的注入器可能是一个组件树中更高级的祖先注入器的代理。 但这只是提升效率的实现细节，我们不用在乎这点差异，在你的脑海里只要想象成每个组件都有自己的注入器就可以了

## 注入器冒泡

当一个组件申请获得一个依赖时，先尝试用该组件自己的注入器来满足它。 如果该组件的注入器没有找到对应的提供商，它就把这个申请转给它父组件的注入器来处理。 如果那个注入器也无法满足这个申请，它就继续转给它的父组件的注入器。 这个申请继续往上冒泡 —— 直到我们找到了一个能处理此申请的注入器或者超出了组件树中的祖先位置为止。 如果超出了组件树中的祖先还未找到，就会抛出一个错误。

# 提供商的注册4种方式

## 类和一个提供商的字面量

```js
import UserServers from './UserServers'
// 供应商中加入
static providers = [ // 提供供应商
  UserServers
]
```

## 备选的类提供商
某些时候，我们会请求一个不同的类来提供服务。 下列代码告诉注入器，当有人请求UserServers时，返回UserBetterServers
src/app/news/index.js
```js
import UserServers from './UserServers'
// 供应商中加入
static providers = [ // 提供供应商
  {provide: UserServers, useClass: UserBetterServers}, 
]
```

第一个是令牌 (token)，它作为键值 (key) 使用，用于定位依赖值和注册提供商。 可以主体类型也可以是一个字符串， 这里建议是一个类型

第二个是一个提供商定义对象。 可以把它看做是指导如何创建依赖值的配方。 有很多方式创建依赖值…… 也有很多方式可以写配方。

#### 备选的类也可以作为一个别名

假设某个旧组件依赖一个OldLogger类。 OldLogger和NewLogger具有相同的接口，但是由于某些原因， 我们不能升级这个旧组件并使用它。

当旧组件想使用OldLogger记录消息时，我们希望改用NewLogger的单例对象来记录。

不管组件请求的是新的还是旧的日志服务，依赖注入器注入的都应该是同一个单例对象。 也就是说，OldLogger应该是NewLogger的别名。

我们当然不会希望应用中有两个不同的NewLogger实例。 不幸的是，如果尝试通过useClass来把OldLogger作为NewLogger的别名，就会导致这样的后果。

## 值提供商
有时，提供一个预先做好的对象会比请求注入器从类中创建它更容易。
src/app/news/config.js
```js
export default {
  color: '#eee'
}
```
于是可以通过useValue选项来注册提供商，它会让这个对象直接扮演 echartWhiteTheme 的角色
src/app/news/index.js
```js
import UserServers from './UserServers'
import cfg from './config'
// 供应商中加入
static providers = [ // 提供供应商
  {provide: 'echartWhiteTheme', useValue: cfg}, 
]
```

## 工厂提供商
有时，我们需要动态创建这个依赖值，因为它所需要的信息直到最后一刻才能确定。 也许这个信息会在浏览器的会话中不停地变化。

还假设这个可注入的服务没法通过独立的源访问此信息。

src/app/news/index.js
```js
import UserServers from './UserServers'
import cfg from './config'

function logger (userServers) {
  console.log(userServers)
}

// 供应商中加入
static providers = [ // 提供供应商
  UserServers,
  {provide: 'echartWhiteTheme', useValue: cfg},
  {provide:  logger, useFactory: {fn: logger, inject: [UserServers]}}
]
```

> useFactory 中`fn`属性是个工厂方法，它的实现是logger

> useFactory 中`inject`属性提供商令牌数组。 UserServers类作为它们自身类提供商的令牌。 注入器解析这些令牌，把相应的服务注入到工厂函数中相应的参数中去。