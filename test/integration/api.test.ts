import { ServiceSchema, ServiceBroker } from 'moleculer'
import axios from 'axios'

import ApiService from '../../services/api.service'
import ZombiesService, { ZombieSchema } from '../../services/zombies.service'
import ZombieItemsService from '../../services/zombie-items.service'
import ZombieItemsMiddlewareService from '../../services/zombie-items-middleware.service'

const MOCK_ITEMS = [
  { id: '1', name: 'Item 1', price: 1 },
  { id: '2', name: 'Item 2', price: 2 },
  { id: '3', name: 'Item 3', price: 3 },
  { id: '4', name: 'Item 4', price: 4 },
  { id: '5', name: 'Item 5', price: 5 },
  { id: '6', name: 'Item 6', price: 6 },
]

const MockItemsService: ServiceSchema = {
  name: 'items',
  actions: {
    get: () => Promise.resolve(MOCK_ITEMS)
  }
}

const MOCK_RATES = [
  { currency: 'EUR', code: 'EUR', bid: 4, ask: 4 },
  { currency: 'USD', code: 'USD', bid: 3, ask: 3 },
]

const MockRatesService: ServiceSchema = {
  name: 'rates',
  actions: {
    get: () => Promise.resolve(MOCK_RATES)
  }
}

const SAMPLE_LIST_RESPONSE = {
  page: expect.any(Number),
  pageSize: expect.any(Number),
  total: expect.any(Number),
  totalPages: expect.any(Number),
}
const makeListResponse = (params: object): object => ({
  ...SAMPLE_LIST_RESPONSE,
  ...params,
})

const SAMPLE_ZOMBIE_1: Omit<ZombieSchema, '_id'> = {
  name: 'Zombie 1',
  items: [],
}

const getFirstZombie = async (): Promise<ZombieSchema> => {
  const { data: listZombieData } = await axios.get(ZOMBIES_URL)
  const zombie = listZombieData && listZombieData.rows && listZombieData.rows[0]

  return zombie
}

const BASE_URL = 'http://localhost:3000/api'
const ZOMBIES_URL = `${BASE_URL}/zombies`
const ITEMS_URL = `items`
const makeItemsUrl = (zombieId: string): string => (`${ZOMBIES_URL}/${zombieId}/${ITEMS_URL}`)

describe('Integration tests', () => {

  const broker = new ServiceBroker({ logger: false, cacher: 'Memory' })
  broker.createService(ApiService)
  broker.createService(ZombiesService)
  broker.createService(ZombieItemsService)
  broker.createService(ZombieItemsMiddlewareService)
  broker.createService(MockItemsService)
  broker.createService(MockRatesService)

  let originalNodeEnv: string

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'integration'
    return broker.start()
  })
  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
    return broker.stop()
  })

  describe('/api/zombies endpoint', () => {

    it('can get empty list of zombies', async () => {
      expect.assertions(1)

      const { data } = await axios.get(ZOMBIES_URL)

      expect(data).toEqual(makeListResponse({ rows: expect.any(Array) }))
    })

    it('can create zombies', async () => {
      expect.assertions(1)

      const zombie1Response = await axios(
        ZOMBIES_URL,
        { method: 'POST', data: SAMPLE_ZOMBIE_1 },
      )

      expect(zombie1Response && zombie1Response.data).toEqual({
        _id: expect.any(String),
        createdAt: expect.any(String),
        ...SAMPLE_ZOMBIE_1,
      })

    })

    it('can get list of all zombies', async () => {
      expect.assertions(1)

      const { data } = await axios.get(ZOMBIES_URL)

      expect(data).toEqual(makeListResponse({
        rows: [
          {
            _id: expect.any(String),
            createdAt: expect.any(String),
            ...SAMPLE_ZOMBIE_1,
          }
        ],
      }))
    })

    it('can get zombie by id', async () => {
      expect.assertions(1)

      const { _id: zombieId } = await getFirstZombie()

      const { data } = await axios.get(`${ZOMBIES_URL}/${zombieId}`)

      expect(data).toEqual({
        _id: expect.any(String),
        createdAt: expect.any(String),
        ...SAMPLE_ZOMBIE_1,
      })
    })

    it('can update zombie name', async () => {
      expect.assertions(2)

      const { _id: zombieId } = await getFirstZombie()

      // update
      const { data: updateData } = await axios(
        `${ZOMBIES_URL}/${zombieId}`,
        { method: 'PUT', data: { name: 'Zombie 123' } }
      )

      expect(updateData).toEqual({
        _id: expect.any(String),
        createdAt: expect.any(String),
        ...SAMPLE_ZOMBIE_1,
        name: 'Zombie 123',
      })

      // rollback
      const { data: rollbackData } = await axios(
        `${ZOMBIES_URL}/${zombieId}`,
        { method: 'PUT', data: { name: SAMPLE_ZOMBIE_1.name } }
      )

      expect(rollbackData).toEqual({
        _id: expect.any(String),
        createdAt: expect.any(String),
        ...SAMPLE_ZOMBIE_1,
      })

    })

    it('can delete zombie by id', async () => {
      expect.assertions(1)

      const { _id: zombieId } = await getFirstZombie()

      const { data } = await axios(
        `${ZOMBIES_URL}/${zombieId}`,
        { method: 'DELETE' }
      )

      expect(data).toBe(1)
    })

  })

  describe('/api/zombies/:zombieId/items endpoint', () => {

    it('can\t get list of items when zombie do not exist', async () => {
      expect.assertions(2)

      try {
        await axios.get(makeItemsUrl('not-existing-zombie-id'))
      } catch (error) {
        const errorResponse = error.response.data
        expect(errorResponse.code).toBe(404)
        expect(errorResponse.name).toBe('EntityNotFoundError')
      }
    })

    it('can create zombies', async () => {
      expect.assertions(1)

      const zombie1Response = await axios(
        ZOMBIES_URL,
        { method: 'POST', data: SAMPLE_ZOMBIE_1 },
      )

      expect(zombie1Response && zombie1Response.data).toEqual({
        _id: expect.any(String),
        createdAt: expect.any(String),
        ...SAMPLE_ZOMBIE_1,
      })

    })

    it('can get list of items', async () => {
      expect.assertions(1)

      const { _id: zombieId } = await getFirstZombie()

      const { data } = await axios.get(makeItemsUrl(zombieId))

      expect(data).toEqual(makeListResponse({
        rows: [],
        pricesTotal: { EUR: 0, USD: 0, PLN: 0 },
      }))
    })

    it('can add items', async () => {
      expect.assertions(1)

      const { _id: zombieId } = await getFirstZombie()

      const { data } = await axios(
        makeItemsUrl(zombieId),
        { method: 'POST', data: { itemId: '1' } }
      )

      expect(data).toEqual({
        _id: expect.any(String),
        createdAt: expect.any(String),
        itemId: '1',
        zombieId: zombieId,
      })
    })

    it('can\t add items that are not on list of items', async () => {
      expect.assertions(3)

      const { _id: zombieId } = await getFirstZombie()

      try {
        const { data } = await axios(
          makeItemsUrl(zombieId),
          { method: 'POST', data: { itemId: 'not-existing-id' } }
        )
      } catch (error) {
        const errorResponse = error.response.data
        expect(errorResponse.code).toBe(403)
        expect(errorResponse.name).toBe('MoleculerError')
        expect(errorResponse.message).toBe('Can\'t add unknown item!')
      }
    })

    it('can\t add more than 5 items to one zombie', async () => {
      expect.assertions(3)

      const { _id: zombieId } = await getFirstZombie()

      await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '2' } })
      await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '3' } })
      await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '4' } })
      await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '5' } })

      try {
        await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '6' } })
      } catch (error) {
        const errorResponse = error.response.data
        expect(errorResponse.code).toBe(403)
        expect(errorResponse.name).toBe('MoleculerError')
        expect(errorResponse.message).toBe('Can\'t add more than 5 items!')
      }
    })

    it('can get single item with priceTotal', async () => {
      expect.assertions(1)

      const { _id: zombieId } = await getFirstZombie()

      const itemId = '1'

      const { data } = await axios.get(makeItemsUrl(zombieId) + '/' + itemId)

      expect(data).toEqual({
        ...MOCK_ITEMS[0],
        zombieId,
        itemId,
        _id: expect.any(String),
        createdAt: expect.any(String),
        pricesTotal: { EUR: 4, USD: 3, PLN: 1 },
      })
    })

    it('can get all zombies items with priceTotal', async () => {
      expect.assertions(1)

      const { _id: zombieId } = await getFirstZombie()

      const { data } = await axios.get(makeItemsUrl(zombieId))

      const USDRates = MOCK_RATES.find((rate) => rate.code === 'USD')
      const EURRates = MOCK_RATES.find((rate) => rate.code === 'EUR')
      const expectedItems = MOCK_ITEMS
        .filter((item, index) => index < 5)
        .map((item) => ({
          ...item,
          itemId: item.id,
          zombieId,
          _id: expect.any(String),
          createdAt: expect.any(String),
        }))
        .sort((a, b): number => Number(b.id) - Number(a.id))

      expect(data).toEqual(makeListResponse({
        rows: expectedItems,
        pricesTotal: {
          EUR: 15 * EURRates.ask,
          USD: 15 * USDRates.ask,
          PLN: 15
        }
      }))
    })

  })

})
