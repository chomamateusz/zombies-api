import { ServiceSchema, Context } from 'moleculer'
import RequestCacheMixin from '../mixins/request-cacher.mixin'

export interface RateSchema {
  currency: string
  code: string
  bid: number
  ask: number
}

const RatesService: ServiceSchema = {

  name: 'rates',

  hooks: {
    after: {
      // transform response - we are only interested in rates
      get: (ctx: Context, res): Promise<any> => {
        return res && res[0] && res[0].rates
      },
    },
  },

  mixins: [
    RequestCacheMixin({
      name: 'Rates',
      url: 'http://api.nbp.pl/api/exchangerates/tables/C/today/',
      updatePeriod: 24 * 60 * 60 * 1000,
    }),
  ],

}

export default RatesService
