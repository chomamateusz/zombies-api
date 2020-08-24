import DbService from 'moleculer-db'
import { ServiceSchema } from 'moleculer'

import { ItemSchema } from './items.service'

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
  },

}

export default ZombiesService
