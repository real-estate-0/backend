import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from 'config'
import moment from 'moment'

export function createContentId(userId: string) {
  return moment().local().format('YYYYMMDDhhmmss') + '-' + userId
}

export function createUniqueId(prefix: string, userId: string) {
  return prefix + '-' + userId + '-' + new Date().getTime()
}

export function createUniqueIdRandom() {
  const randomKey = uuidv4().replace(/-/gi, '')
  console.log('createUniqueRandom', randomKey)
  return randomKey
}

export function validatePassword(input: string, origin: string) {
  console.log('validatePassword', origin, input)
  return bcrypt.compare(input, origin)
}

export function generateJWTToken(userId: string) {
  const SECRET_KEY = config.get('SECRET_KEY')
  console.log('generate sk', SECRET_KEY)
  return jwt.sign({ userId: userId }, SECRET_KEY)
}
