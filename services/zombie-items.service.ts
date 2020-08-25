import DbService from 'moleculer-db'
import { ServiceSchema, Context, Errors } from 'moleculer'

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
      async create(ctx: Context): Promise<any> {
        const params: { zombieId?: string } = ctx.params
        const zombieId = params.zombieId

        if (!zombieId) return ctx

        const count: number = await ctx.call('zombie-items.count', { query: { zombieId } })

        if (count >= 5) throw new Errors.MoleculerError('Can\'t add more than 5 items!', 403)
      },
    },

  },

  settings: {
    fields: ['_id', 'zombieId', 'itemId'],
    entityValidator: {
      zombieId: 'string',
      itemId: 'string',
    },
  },

}

export default ZombieItemsService
