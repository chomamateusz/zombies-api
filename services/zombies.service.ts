import DbService from 'moleculer-db'
import { ServiceSchema, Context } from 'moleculer'

import { ItemSchema } from './items.service'

export interface ZombieSchema {
  _id: string
  name: string
  items?: ItemSchema[]
}

const ZombiesService: ServiceSchema = {

  name: 'zombies',

  mixins: [DbService],

  hooks: {
    before: {
      create: 'createdAt'
    },
  },

  settings: {
    fields: ['_id', 'name', 'createdAt'],
    entityValidator: {
      name: 'string',
    },
    populate: {
      items: 'zombie-items.get',
    }
  },

  methods: {
    createdAt: (ctx: Context): Context => {
      const params: { createdAt?: string } = ctx.params
      ctx.params = {
        ...params,
        createdAt: new Date(),
      }
      return ctx
    }
  }

}

export default ZombiesService
