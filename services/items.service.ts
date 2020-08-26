import { ServiceSchema, Context } from 'moleculer'
import RequestCacheMixin from '../mixins/request-cacher.mixin'

export interface ItemSchema {
  id: string
  name: string
  price: number
}

const ItemsService: ServiceSchema = {

  name: 'items',

  hooks: {
    after: {
      // transform response - we are only interested in items
      get: (ctx: Context, res): Promise<any> => {
        return res && res.items
      },
    },
  },

  mixins: [
    RequestCacheMixin({
      name: 'items',
      url: 'https://zombie-items-api.herokuapp.com/api/items',
      updatePeriod: 24 * 60 * 60 * 1000,
    }),
  ],

}

export default ItemsService
