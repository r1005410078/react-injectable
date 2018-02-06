/**
 * 存取所有需要注入的属性，默认值是null
 */
export default class InjectStore {
  static store = {}
  constructor (displayName) {
    InjectStore.store[displayName] = this
  }
  static createInjectStore (displayName) {
    if (!InjectStore.store[displayName]) {
      return new InjectStore(displayName)
    }
    return InjectStore.getInjectStore(displayName)
  }
  static getInjectStore (displayName) {
    return InjectStore.store[displayName]
  }
  insert (name) {
    this[name] = null
  }
  update (name, value) {
    this[name] = value
  }
}