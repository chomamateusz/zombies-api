import DbService from 'moleculer-db'
import { ServiceSchema, Context, Errors } from 'moleculer'
import { ItemSchema } from './items.service'

export interface ZombieItemSchema {
  _id: string;
  zombieId: string;
  itemId: string;
}

const ZombieItemsService: ServiceSchema = {

  name: 'zombie-items',

  mixins: [DbService],

  hooks: {

    before: {
      update: 'checkItemExist',
      create: ['checkItemExist', 'maxItems'],
    },

  },

  settings: {
    fields: ['_id', 'zombieId', 'itemId'],
    entityValidator: {
      zombieId: 'string',
      itemId: 'string',
    },
  },


  methods: {

    checkItemExist: async (ctx: Context): Promise<any> => {
      if (process.env.NODE_ENV === 'test') return ctx

      const params: { itemId?: string } = ctx.params
      const itemId = params.itemId

      const items: ItemSchema[] = await ctx.call('items.get')

      const item = items.find((item) => item.id === itemId)

      if (!item) throw new Errors.MoleculerError('Can\'t add unknown item!', 403)

      return ctx
    },

    maxItems: async (ctx: Context): Promise<any> => {
      const params: { zombieId?: string } = ctx.params
      const zombieId = params.zombieId

      if (!zombieId) return ctx

      const count: number = await ctx.call('zombie-items.count', { query: { zombieId } })

      if (count >= 5) throw new Errors.MoleculerError('Can\'t add more than 5 items!', 403)
    },

  }

}

export default ZombieItemsService
