import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InjectStore from './InjectStore'
import IOCStore, { CreateProvides, Injecter } from './IOCStore';

const Injection = (Target, name, descriptor, injectStore) => {
  /**
   * 注入组件:主要用来把提供商注入到组件的context中
   */
  class Injection extends React.PureComponent {
    static displayName = `Injection(${Target.displayName})`
    static contextTypes = {
      providers: PropTypes.instanceOf(IOCStore)
    }
    static childContextTypes = {
      providers: PropTypes.instanceOf(IOCStore)
    }
    atProvide = null //当前组件的提供商
    injecter = null
    constructor (props, context) {
      super(props)
      this.addCfgProvideIOCStore(context)
      this.injecter = this.atProvide.getMethod(Injecter)
      this.propertyInjection(Target)
    }
    /**
     * 把配置提供商添加到IOC容器中
     */
    addCfgProvideIOCStore (context) {
      const providers = (
        context.providers ? context.providers.providers.concat(Target.providers)  : (Target.providers || [])
      )
      .map(provide => (typeof provide === 'function' ? {provide, useClass: provide} : provide))
      .filter(provide => provide)

      const componentName = Target.displayName
      const parentProviders = context.providers

      if (parentProviders instanceof IOCStore) {
        this.atProvide = IOCStore.addProvide({componentName, providers}, parentProviders)
      } else if (providers && providers instanceof Array) {
        this.atProvide = IOCStore.addProvide({componentName, providers})
      }
    }
    /**
     * 如果需要使用到被依赖对象的某个属性，在被依赖对象被创建之后，IoC容器会自动初始化该属性
     */
    propertyInjection (Class) {
      const injectPropertys = InjectStore.getInjectStore(Class.displayName) || {}
      for (const injectKey in injectPropertys) {
        const token = Reflect.getMetadata('design:type', Class, injectKey)
        const Method = this.atProvide.getMethod(token)
        //console.log(Target.displayName, injectKey, token)
        if (Method.displayName) {
          this.propertyInjection(Method)
        }
        const methodResult = this.injecter.get(token)
        this.atProvide.addProvidersMethodResult(token, methodResult)
        injectPropertys.update(injectKey, methodResult)
      }
    }
    getChildContext () {
      return this.atProvide ? {providers: this.atProvide} : null
    }
    render () {
      return <Target {...this.props} />
    }
  }

  return Injection
}

export default function Injectable () {
  /**
   * 装饰服务Injectable
   * @param {*} Target 
   * @param {*} name
   * @param {*} descriptor
   */
  function serversInjectable (Target, name, descriptor, injectStore) {}

  /**
   * 装饰组件Injectable
   * @param {*} Target 
   * @param {*} name
   * @param {*} descriptor
   */
  function componentInjectable (Target, name, descriptor, injectStore) {
    return Injection(Target, name, descriptor, injectStore)
  }

  return function (Target, name, descriptor) {  
    Object.defineProperty(Target, '_Injectable', {
      writable: false,
      value: 1
    })

    Target.displayName = Target.displayName || Target.name

    const injectStore = InjectStore.getInjectStore(Target.displayName)
    if (Component.isPrototypeOf(Target)) {
      return componentInjectable(Target, name, descriptor, injectStore)
    } else {
      return serversInjectable(Target, name, descriptor, injectStore)
    }
  }
}