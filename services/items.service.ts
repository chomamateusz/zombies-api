import { ServiceSchema } from 'moleculer'
import RequestCacheMixin from '../mixins/request-cacher.mixin'

export interface ItemSchema {
  id: string
  name: string
  price: number
}

const ItemsService: ServiceSchema = {

  name: 'items',

  mixins: [
    RequestCacheMixin({
      name: 'items',
      url: 'https://zombie-items-api.herokuapp.com/api/items',
      updatePeriod: 24 * 60 * 60 * 1000,
    }),
  ],

}

export default ItemsService
