import { ServiceSchema, Context } from 'moleculer'
import axios from 'axios'

const ITEMS_URL = 'https://zombie-items-api.herokuapp.com/api/items'

export interface ItemSchema {
  _id: string;
  name: string;
  price: number;
}

const ItemsService: ServiceSchema = {

  name: 'items',

  settings: {
    lastUpdate: 0,
    updatePeriod: 24 * 60 * 60 * 1000,
    fields: ['_id', 'name', 'price'],
    entityValidator: {
      name: 'string',
      items: 'number',
    },
  },

  actions: {
    get: {
      async handler() {
        console.log(this.settings.lastUpdate, this.settings.updatePeriod)

        if (this.serveFromCache()) {
          this.logger.info('[ITEMS] Item\'s are served from cache!')
          return this.broker.cacher.get('items.get')
        }

        this.logger.info('[ITEMS] Get request. Item\'s are NOT served from cache!')
        const { data } = await axios.get(ITEMS_URL)

        this.broker.cacher.set('items.get', data)

        console.log(this.settings.lastUpdate, this.settings.updatePeriod)

        return data
      },
    },
  },

  methods: {
    serveFromCache() {
      const now = Date.now()
      const updatePeriod = this.settings.updatePeriod
      const lastUpdate = this.settings.lastUpdate
      const periodsPassed = Math.floor((now - (now % updatePeriod)) / updatePeriod)

      if (lastUpdate === periodsPassed) return true

      this.settings.lastUpdate = periodsPassed

      return false
    },
  },

}

export default ItemsService
