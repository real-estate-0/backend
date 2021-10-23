import moment from 'moment'
import { customAlphabet } from 'nanoid'

export function createContentId(userId: string) {
  return moment().local().format('YYYYMMDDhhmmss') + '-' + userId
}

export function createUniqueId(prefix: string ="", postfix: string="")  {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21) 
  return prefix + nanoid() + postfix
}
