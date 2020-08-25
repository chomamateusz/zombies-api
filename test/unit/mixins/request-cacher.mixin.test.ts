import { ServiceSchema, ServiceBroker } from 'moleculer'
import RequestCacherMixin from '../../../mixins/request-cacher.mixin'

const UPDATE_PERIOD = 100
const MOCK_DATA = [
  {
    currency: 'korona czeska',
    code: 'CZK',
    bid: 0.1668,
    ask: 0.1702
  },
  {
    currency: 'korona duńska',
    code: 'DKK',
    bid: 0.5843,
    ask: 0.5961
  },
]

const mockFetch = jest.fn(() => Promise.resolve({ data: MOCK_DATA }))

const TestService: ServiceSchema = {
  name: 'test',
  mixins: [
    RequestCacherMixin({
      name: 'test',
      url: 'do-not-matter-if-mock-fetch-is-passed',
      updatePeriod: UPDATE_PERIOD,
      fetchFunction: mockFetch,
    }),
  ],
}


describe('Test \'RequestCacher\' mixin', () => {

  const broker = new ServiceBroker({ logger: false, cacher: 'Memory' })
  broker.createService(TestService)

  beforeAll(() => broker.start())
  afterAll(() => broker.stop())

  it('gets items from real service for first time', async () => {
    expect.assertions(2)

    const response = await broker.call('test.get')

    expect(response).toEqual(MOCK_DATA)
    expect(mockFetch).toBeCalledTimes(1)
  })

  it('gets items from cache during the updatePeriod', async () => {
    expect.assertions(2)

    const response = await broker.call('test.get')

    expect(response).toEqual(MOCK_DATA)
    expect(mockFetch).toBeCalledTimes(1)
  })

  it('reload items after the updatePeriod', async () => {
    expect.assertions(2)

    await new Promise(resolve => setTimeout(resolve, UPDATE_PERIOD))

    const response = await broker.call('test.get')

    expect(response).toEqual(MOCK_DATA)
    expect(mockFetch).toBeCalledTimes(2)
  })

})
