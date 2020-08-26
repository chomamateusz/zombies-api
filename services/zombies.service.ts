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
  
}

export default ZombiesService
