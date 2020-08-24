import DbService from 'moleculer-db'
import { ServiceSchema } from 'moleculer'

export interface ItemSchema {
  _id: string;
  name: string;
  price: number;
}

const ItemsService: ServiceSchema = {

  name: 'items',

  mixins: [DbService],

  settings: {
    fields: ['_id', 'name', 'price'],
    entityValidator: {
      name: 'string',
      items: 'number',
    },
  },

}

export default ItemsService
