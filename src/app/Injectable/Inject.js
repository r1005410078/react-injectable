import InjectStore from './InjectStore'
import 'reflect-metadata'
let oldDispalyName = ''
let injects = {}
export default function Inject (types) {
  /**
   * 局部变量装饰
   * @param {*} Target
   * @param {*} name
   * @param {*} descriptor
   */
  function localVariable (Target, name, descriptor) {
    const displayName = Target.constructor.displayName = Target.constructor.displayName || Target.constructor.name
    if (oldDispalyName !== displayName) {
      injects[displayName] = InjectStore.createInjectStore(displayName)
      oldDispalyName = displayName
    }
    injects[displayName].insert(name)
    Reflect.defineMetadata('design:type', types, Target.constructor, name)
    return {
      configurable: true,
      get: function () {
        return injects[displayName][name]
      }
    }
  }

  /**
   * 形参
   * @param {*} Target
   * @param {*} name
   * @param {*} descriptor
   */
  function formalParameter (Target, name, descriptor) {
    // typescript 编译去做
  }

  if (typeof descriptor === 'number') {
    return formalParameter
  } else {
    return localVariable
  }
}

/**
 * 创建Token
 */
export class InjectToken {
  static tokens = {}
  constructor (token) {
    this.token = token
    InjectToken.tokens[token] = this
  }
}

export function createToken (token) {
  return InjectToken.tokens[token] || new InjectToken(token)
}
