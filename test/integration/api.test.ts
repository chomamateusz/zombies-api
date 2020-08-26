import { ServiceSchema, ServiceBroker } from 'moleculer'
import axios, { AxiosResponse } from 'axios'

import ApiService from '../../services/api.service'
import ZombiesService, { ZombieSchema } from '../../services/zombies.service'
import ZombieItemsService from '../../services/zombie-items.service'
import ZombieItemsMiddlewareService from '../../services/zombie-items-middleware.service'
import RatesService from '../../services/rates.service'

const MOCK_ITEMS = [
  { id: '1', name: 'Item 1', price: 1 },
  { id: '2', name: 'Item 2', price: 2 },
  { id: '3', name: 'Item 3', price: 3 },
  { id: '4', name: 'Item 4', price: 4 },
  { id: '5', name: 'Item 5', price: 5 },
]

const MockItemsService: ServiceSchema = {
  name: 'items',
  actions: {
    get: () => Promise.resolve(MOCK_ITEMS)
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
  broker.createService(RatesService)

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
        ...SAMPLE_ZOMBIE_1,
      })

    })

    it('can get list of items', async () => {
      expect.assertions(1)

      const { _id: zombieId } = await getFirstZombie()

      const { data } = await axios.get(makeItemsUrl(zombieId))

      expect(data).toEqual(makeListResponse({ rows: [] }))
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

      await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '1' } })
      await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '2' } })
      await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '3' } })
      await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '4' } })

      try {
        await axios(makeItemsUrl(zombieId), { method: 'POST', data: { itemId: '5' } })
      } catch (error) {
        const errorResponse = error.response.data
        expect(errorResponse.code).toBe(403)
        expect(errorResponse.name).toBe('MoleculerError')
        expect(errorResponse.message).toBe('Can\'t add more than 5 items!')
      }
    })

  })

})
