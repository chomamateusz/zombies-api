import { ServiceSchema } from 'moleculer'
import axios from 'axios'

export interface CacherParams {
  name: string
  url: string
  updatePeriod: number
  fetchFunction?: Function
}

const RequestCacheMixin = (params: CacherParams): ServiceSchema => {

  const fetch = params.fetchFunction || axios

  return {
    name: params.name,

    settings: {
      lastUpdate: 0,
      updatePeriod: params.updatePeriod,
    },

    actions: {
      get: {
        async handler() {
          if (this.serveFromCache()) {
            this.logger.info(`[${params.name.toUpperCase()}] Item\'s are served from cache!`)
            return this.broker.cacher.get(`${params.name}--cache.get`)
          }

          this.logger.info(`[${params.name.toUpperCase()}] Get request. Item\'s are NOT served from cache!`)
          const { data } = await fetch(params.url, { method: 'GET' })

          this.broker.cacher.set(`${params.name}--cache.get`, data)

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
}

export default RequestCacheMixin
