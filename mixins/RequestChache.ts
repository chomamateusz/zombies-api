import { ServiceSchema } from 'moleculer'
import axios from 'axios'

export interface CacherParams {
  name: string;
  url: string;
  updatePeriod: number;
}

const RequestCacheMixin = (params: CacherParams): ServiceSchema => ({
  name: params.name,

  settings: {
    lastUpdate: 0,
    updatePeriod: params.updatePeriod,
  },

  actions: {
    get: {
      async handler() {
        console.log(this.settings.lastUpdate, this.settings.updatePeriod)

        if (this.serveFromCache()) {
          this.logger.info(`[${params.name.toUpperCase()}] Item\'s are served from cache!`)
          return this.broker.cacher.get(`${params.name}--cache.get`)
        }

        this.logger.info(`[${params.name.toUpperCase()}] Get request. Item\'s are NOT served from cache!`)
        const { data } = await axios.get(params.url)

        this.broker.cacher.set(`${params.name}--cache.get`, data)

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

})

export default RequestCacheMixin
