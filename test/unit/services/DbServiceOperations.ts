import { ServiceBroker } from 'moleculer'

export interface ListDBActionResponse<ItemSchema> {
  rows: Array<ItemSchema>
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface IdWise {
  _id: string
}

const DbServiceOperations = class DbServiceOperations<ItemSchema extends IdWise> {

  constructor(
    public broker: ServiceBroker,
    public serviceName: string,
    public makeItem: (index: number) => Omit<ItemSchema, '_id'>,
    public makeItemWithWrongParamsNames: (index: number) => object,
    public makeItemWithWrongParamsTypes: (index: number) => object,
  ) { }

  makeItemExpectation(index: number): object {
    const item = this.makeItem(index)
    return {
      ...item,
      _id: expect.any(String),
    }
  }

  async getFirst(): Promise<ItemSchema> {
    const res: ListDBActionResponse<ItemSchema> = await this.broker.call(`${this.serviceName}.list`)
    const items = res.rows
    const item = items[0]

    if (!item) return Promise.reject()

    return item
  }

  async create(index: number): Promise<ItemSchema> {
    return this.broker.call(`${this.serviceName}.create`, this.makeItem(index))
  }

  async deleteAll(): Promise<number[]> {
    const res: ListDBActionResponse<ItemSchema> = await this.broker.call(`${this.serviceName}.list`)
    const zombies = res.rows
    const zombiesIds = zombies.map((zombie) => zombie._id)

    const deletePromises: Promise<number>[] = zombiesIds.map((zombieId) => this.broker.call(`${this.serviceName}.remove`, { id: zombieId }))

    return Promise.all(deletePromises)
  }

  async list(): Promise<ListDBActionResponse<ItemSchema>> {
    return this.broker.call(`${this.serviceName}.list`)
  }

}

export default DbServiceOperations