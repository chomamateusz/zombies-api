import DbService from 'moleculer-db'
import { ServiceSchema } from 'moleculer'

export interface ZombieItemSchema {
  _id: string;
  zombieId: string;
  itemId: string;
}

const ZombieItemsService: ServiceSchema = {

  name: 'zombie-items',

  mixins: [DbService],

  hooks: {},

  settings: {
    fields: ['_id', 'zombieId', 'itemId'],
    entityValidator: {
      zombieId: 'string',
      itemId: 'string',
    },
  },

}

export default ZombieItemsService
