import { ServiceSchema, Context, Errors } from 'moleculer'
import { RateSchema } from './rates.service'
import { ItemSchema } from './items.service'

export interface ZombieItemSchema {
  _id: string
  zombieId: string
  itemId: string
}

export interface ZombieItemPopulatedSchema {
  _id: string
  zombieId: string
  itemId: string
  name: string
  price: number
}

const ZombieItemsService: ServiceSchema = {

  name: 'zombie-items-middleware',

  hooks: {
    before: {
      '*': 'checkZombieId',
    },
    after: {
      get: 'populateItems'
    }
  },

  actions: {
    get(ctx: Context) {
      const params: { id?: string, zombieId?: string } = ctx && ctx.params
      const id = params.id
      const zombieId = params.zombieId

      if (!id) return ctx.call('zombie-items.list', { query: { zombieId }, sort: '-createdAt' })

      return ctx.call('zombie-items.find', { query: { zombieId, _id: id } }).then(([item]) => item)
    },
    create(ctx: Context) {
      return ctx.call('zombie-items.create', ctx.params)
    },
    update(ctx: Context) {
      return ctx.call('zombie-items.update', ctx.params)
    },
    remove(ctx: Context) {
      return ctx.call('zombie-items.remove', ctx.params)
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

    async populateItems(ctx: Context, res: any): Promise<object> {
      const params: { id?: string } = ctx && ctx.params
      const id = params.id

      if (id) {
        const populatedItem = await this.populateItem(ctx, res)
        const pricesTotal = await this.calculateItemsValue(ctx, [populatedItem])

        return {
          ...populatedItem,
          pricesTotal,
        }
      }

      const items: ZombieItemSchema[] = res.rows
      const populatedItems = await Promise.all(items.map((item) => this.populateItem(ctx, item)))
      const pricesTotal = await this.calculateItemsValue(ctx, populatedItems)

      return {
        ...res,
        rows: populatedItems,
        pricesTotal,
      }
    },

    populateItem: async (ctx: Context, item: ZombieItemSchema): Promise<ZombieItemPopulatedSchema> => {
      const itemId = item && item.itemId

      const items: ItemSchema[] = await ctx.call('items.get')

      const populatedItem = items && items.find((item) => String(item.id) === String(itemId))

      return {
        ...item,
        ...populatedItem,
      }
    },

    calculateItemsValue: async (ctx: Context, items: ZombieItemPopulatedSchema[]): Promise<object> => {
      if (items.length === 0) return { EUR: 0, USD: 0, PLN: 0 }

      const sumPLN = items.reduce((sum, item) => sum + item.price, 0)

      const rates: RateSchema[] = await ctx.call('rates.get')

      const rateEUR = rates.find((rate) => rate.code === 'EUR')
      const rateUSD = rates.find((rate) => rate.code === 'USD')

      const sumEUR = rateEUR ? (sumPLN * rateEUR.ask) : 0
      const sumUSD = rateUSD ? (sumPLN * rateUSD.ask) : 0

      return { EUR: sumEUR, USD: sumUSD, PLN: sumPLN }
    },

  }

}

export default ZombieItemsService
