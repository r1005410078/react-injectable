/**
 * 创建一个服务商
 */
export class Createproviders {
  parentComponentName = '' // 父组件的名字
  componentName = '' // 本组件的名字
  providers = [] // 服务商
  constructor (parentComponentName, componentName, providers = []) {
    this.parentComponentName = parentComponentName
    this.parentComponentName = componentName
    this.parentComponentName = providers
  }
}
/**
 * 供应商
 */
class Provide {
  useKind = 'useClass' // useClass | useValue | useFactory
  token = null
  method = null
  methodResult = null
  constructor (useKind, token, method, methodResult) {
    this.token = token
    this.method = method
    this.useKind = useKind
    this.methodResult = methodResult
  }
  setMethodResult (result) {
    this.methodResult = this.methodResult || result
  }
}

/**
 * 构造器注入（Constructor Injection）：IoC容器会智能地选择选择和调用适合的构造函数以创建依赖的对象。如果被选择的构造函数具有相应的参数，IoC容器在调用构造函数之前解析注册的依赖关系并自行获得相应参数对象；
 * 
 * 属性注入（Property Injection）：如果需要使用到被依赖对象的某个属性，在被依赖对象被创建之后，IoC容器会自动初始化该属性；
 * 
 * 方法注入（Method Injection）：如果被依赖对象需要调用某个方法进行相应的初始化，在该对象创建之后，IoC容器会自动调用该方法
 */
export default class IOCStore {
  // new Provide()
  value = {
    tokens: [],
    provides: []
  }
  componentName = ''
  children = {}
  constructor (componentName, providers, value) {
    this.value = value
    this.providers = providers
    this.componentName = componentName
  }
  /**
   * 给供应商提供一个实体
   * @param {*} token 
   * @param {*} value 
   */
  addProvidersMethodResult (token, value) {
    for (const key in this.providers) {
      if (this.providers[key].provide === token) {
        this.providers[key]['methodResult'] = value
      }
    }
  }
  /**
   * 根据属性获取对应的提供商信息
   * @param {*} attributeName 
   * @param {*} token 
   */
  getProvideAttribute (attributeName, token) {
    const tokenIndex = this.value.tokens.indexOf(token)
    if (tokenIndex === -1) {
      throw new Error(`No token [${token.name || token}] is found in the provider`)
    }
    return this.value.provides[tokenIndex][attributeName]
  }
  getUseKind (token) {
    return this.getProvideAttribute('useKind', token)
  }
  getToken (token) {
    return this.getProvideAttribute('token', token)
  }
  getMethod (token) {
    return this.getProvideAttribute('method', token)
  }
}

// IOC的容器
IOCStore.store = {
  /**
    componentName: {
      componentName: ''
      value: {
        [token]: new Provide()
      },
      children: {
        componentName: {
          value: new Provide(),
          children: {
            
          }
        }
      }
    }
  */
}

/**
 * 查找父节点
 * @param {*} parentComponentName 
 */
IOCStore.findParentNode = parentComponentName => {
  let recordParentValue // 记录对应的值
  const whileStore = (store) => {
    for (const key in store) {
      if (key === parentComponentName) {
        recordParentValue = store[key]
      } else {
        if (store[key] instanceof Object) {
          whileStore(store[key])
        }
      }
    } 
  }
  whileStore(IOCStore.store)
  return recordParentValue
}

/**
 * 执行工厂方法
 * @param {*} useFactory 
 * @param {*} inject 
 */
function runUseFactory (useFactory, inject) {
  return useFactory()
}

/**
 * 执行类方法
 * @param {*} useClass 
 */
function runUseClass (useClass) {
  return useClass()
}

/**
 * 注入器
 */
export class Injecter {
  values = {
    tokens: [],
    provides: []
  } 
  constructor (values) {
    this.values = values
  }
  get (token) {
    const tokenIndex = this.values.tokens.indexOf(token)
    if (tokenIndex > -1) {
      const provide = this.values.provides[tokenIndex]
      const useKind = provide.useKind
      return this[useKind](provide)
    }
    throw new Error(`be short of providers [${token.name || token}]`)
  }
  useClass (provide) {
    const UseClass = provide.method
    if (!provide.methodResult) {
      provide.setMethodResult(new UseClass())
    }
    return provide.methodResult
  }
  useFactory (provide) {
    const {fn, inject = []} = provide.method
    // console.log(22222, inject)
    
    return fn.apply(this, inject.map(token => this.get(token)))
  }
  useValue (provide) {
    return provide.method
  }
}

/**
 * 把供应商装进Provide模型中去
 * @param {*} componentName 
 * @param {*} providers 
 */
function PackIntoProvide (providers = []) {
  const value = {
    tokens: [],
    provides: []
  }
  for (let i = 0; i < providers.length; i ++) {
    const {provide, useClass, useValue, useFactory, inject = [], methodResult} = providers[i]
    let tokensIndex = value.tokens.indexOf(provide)
    if (tokensIndex > -1) {
      // 如果找到对应的key 就先删除它
      value.tokens.splice(tokensIndex, 1)
      value.provides.splice(tokensIndex, 1)
    }

    //加入token与计算新加的token的位置
    value.tokens.push(provide)
    tokensIndex = value.tokens.length - 1
    
    if (useClass) {
      value.provides[tokensIndex] = new Provide('useClass', provide, useClass, methodResult)
    } else if (useFactory) {
      value.provides[tokensIndex] = new Provide('useFactory', provide, useFactory, methodResult)
    } else if (useValue) {
      value.provides[tokensIndex] = new Provide('useValue', provide, useFactory, methodResult)
    } else {
      throw new Error('Provider support only {  useClass, useValue, useFactory  }')
    }
  }
  const injecter = new Provide('useValue', Injecter, new Injecter(value), new Injecter(value))
  value.tokens.push(Injecter)
  value.provides.push(injecter)
  if (value.tokens.indexOf(Injecter) !== value.provides.indexOf(injecter)) {
    throw new Error('IOCStore Access error')
  }
  return value
}

/**
 * 添加供应商
 * @param {*} parentIOCStore 
 * @param {*} createproviders 
 */
IOCStore.addProvide = (createproviders, parentIOCStore) => {
  const {componentName, providers} = createproviders
  if (parentIOCStore) {
    const stockIOCStore = parentIOCStore.children[componentName] // 库存
    const stockProviders = stockIOCStore ? stockIOCStore.providers : []
    const _providers = stockProviders.concat(providers)
    // 有父节点
    parentIOCStore.children[componentName] = new IOCStore(
      componentName,
      _providers,
      PackIntoProvide(_providers)
    )
    return parentIOCStore.children[componentName]
  }

  const stockIOCStore = IOCStore.store[componentName] // 库存
  const stockProviders = stockIOCStore ? stockIOCStore.providers : []
  const _providers = stockProviders.concat(providers)

  IOCStore.store[componentName] = new IOCStore(componentName, _providers, PackIntoProvide(_providers))
  return IOCStore.store[componentName]
}
