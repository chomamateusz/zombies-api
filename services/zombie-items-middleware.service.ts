import { ServiceSchema, Context, Errors } from 'moleculer'
import { RateSchema } from './rates.service'

export interface ZombieItemSchema {
  _id: string;
  zombieId: string;
  itemId: string;
}

const ZombieItemsService: ServiceSchema = {

  name: 'zombie-items-middleware',

  hooks: {
    before: {
      '*': 'checkZombieId',
    },
  },

  actions: {
    get(ctx: Context) {
      const params: { itemId?: string, zombieId?: string } = ctx && ctx.params
      const itemId = params.itemId
      const zombieId = params.zombieId

      if (!itemId) return ctx.call('zombie-items.find', { query: { zombieId } })

      return ctx.call('zombie-items.find', { query: { zombieId, _id: itemId } }).then(([item]) => item)
    },
    create(ctx: Context) {
      return ctx.call('zombie-items.create', ctx.params)
    },
    update(ctx: Context) {
      return ctx.call('zombie-items.update', ctx.params)
    },
    list(ctx: Context) {
      return ctx.call('zombie-items.list', ctx.params)
    },
  },

  methods: {

    checkZombieId: async (ctx: Context): Promise<any> => {
      const params: { zombieId?: string } = ctx && ctx.params
      const zombieId = params.zombieId

      if (!zombieId) throw new Errors.MoleculerError('Can\t perform operations without zombieId', 403)

      try {
        await ctx.call('zombies.get', { id: zombieId })
      } catch (error) {
        return Promise.reject(error)
      }

      return
    },

    // calculateItemsValue: async (ctx: Context, res: ZombieItemSchema[]): Promise<any> => {
    //   if (!(res && res.items && Array.isArray(res.items))) return res

    //   const sumPLN = res.items.reduce((sum, item) => sum + item.price, 0)

    //   const rates: RateSchema[] = await ctx.call('rates.get')

    //   const rateEUR = rates.find((rate) => rate.code === 'EUR')
    //   const rateUSD = rates.find((rate) => rate.code === 'EUR')

    //   const sumEUR = rateEUR ? (sumPLN * rateEUR.ask) : null
    //   const sumUSD = rateUSD ? (sumPLN * rateUSD.ask) : null

    //   return {
    //     ...res,
    //     total: { EUR: sumEUR, USD: sumUSD, PLN: sumPLN },
    //   }

    // },

  }

}

export default ZombieItemsService
