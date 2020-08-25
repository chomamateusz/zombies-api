import { ServiceSchema, ServiceBroker } from 'moleculer'
import axios, { AxiosResponse } from 'axios'

import ApiService from '../../services/api.service'
import ZombiesService, { ZombieSchema } from '../../services/zombies.service'
import ZombieItemsService from '../../services/zombie-items.service'
import ItemsService, { ItemSchema } from '../../services/items.service'
import RatesService from '../../services/rates.service'


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
const SAMPLE_ZOMBIE_2: Omit<ZombieSchema, '_id'> = {
  name: 'Zombie 2',
  items: [],
}

const getFirstZombie = async (): Promise<ZombieSchema> => {
  const { data: listZombieData } = await axios.get(ZOMBIES_URL)
  const zombie = listZombieData && listZombieData.rows && listZombieData.rows[0]

  return zombie
}

const BASE_URL = 'http://localhost:3000/api'
const ZOMBIES_URL = `${BASE_URL}/zombies`

describe('Integration tests', () => {

  const broker = new ServiceBroker({ logger: false, cacher: 'Memory' })
  broker.createService(ApiService)
  broker.createService(ZombiesService)
  broker.createService(ZombieItemsService)
  broker.createService(ItemsService)
  broker.createService(RatesService)

  beforeAll(() => broker.start())
  afterAll(() => broker.stop())

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

  })

})

