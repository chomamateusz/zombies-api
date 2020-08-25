import DbService from 'moleculer-db'
import { ServiceSchema, Context } from 'moleculer'

import { ItemSchema } from './items.service'
import { RateSchema } from './rates.service'

export interface ZombieSchema {
  _id: string;
  name: string;
  items: ItemSchema[];
}

const ZombiesService: ServiceSchema = {

  name: 'zombies',

  mixins: [DbService],

  hooks: {
    after: {
      get: 'calculateItemsValue',
    },
  },

  settings: {
    fields: ['_id', 'name', 'items'],
    entityValidator: {
      name: 'string',
      items: 'array',
    },
    populate: {
      items: 'zombie-items.get',
    }
  },

  moleculer: {

    calculateItemsValue: async (ctx: Context, res: ZombieSchema): Promise<any> => {
      if (!(res && res.items && Array.isArray(res.items))) return res

      const sumPLN = res.items.reduce((sum, item) => sum + item.price, 0)

      const rates: RateSchema[] = await ctx.call('rates.get')

      const rateEUR = rates.find((rate) => rate.code === 'EUR')
      const rateUSD = rates.find((rate) => rate.code === 'EUR')

      const sumEUR = rateEUR ? (sumPLN * rateEUR.ask) : null
      const sumUSD = rateUSD ? (sumPLN * rateUSD.ask) : null

      return {
        ...res,
        total: { EUR: sumEUR, USD: sumUSD, PLN: sumPLN },
      }

    },

  },

}

export default ZombiesService
