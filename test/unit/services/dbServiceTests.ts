import 'jest-extended'
import { ServiceSchema, ServiceBroker, Errors } from 'moleculer'

import DbServiceOperations, { ListDBActionResponse } from './DbServiceOperations'

interface MakeDbServiceTests<ItemSchema> {
  service: ServiceSchema,
  makeItem: (index: number) =>  Omit<ItemSchema, '_id'>
  makeItemWithWrongParamsNames: (index: number) => object
  makeItemWithWrongParamsTypes: (index: number) => object,
}

interface IdWise {
  _id: string
}

const makeDbServiceTests = <ItemSchema extends IdWise>({
  service,
  makeItem,
  makeItemWithWrongParamsNames,
  makeItemWithWrongParamsTypes,
}: MakeDbServiceTests<ItemSchema>) => {
  
  const serviceName = service.name
  if(!serviceName) throw new Error('Can\'t run if service do not have name!')

  describe(`Test \'${serviceName}\' service`, () => {

    const broker = new ServiceBroker({ logger: false })
    broker.createService(service)
  
    const dbService = new DbServiceOperations<ItemSchema>(
      broker,
      serviceName,
      makeItem,
      makeItemWithWrongParamsNames,
      makeItemWithWrongParamsTypes,
    )

    beforeAll(() => broker.start())
    afterAll(() => broker.stop())

    afterEach(() => dbService.deleteAll())

    describe('Test \'create\' action', () => {

      it('should return created object', async () => {
        expect.assertions(1)
        const createdItem = await dbService.create(1)
        expect(createdItem).toEqual(dbService.makeItemExpectation(1))
      })

      it('should fail with no parameters', async () => {
        expect.assertions(1)
        try {
          await broker.call(`${serviceName}.create`, {})
        } catch (err) {
          expect(err).toBeInstanceOf(Errors.ValidationError)
        }
      })

      it('should fail with wrong parameters', async () => {
        expect.assertions(1)
        try {
          await broker.call(`${serviceName}.create`, dbService.makeItemWithWrongParamsNames(1))
        } catch (err) {
          expect(err).toBeInstanceOf(Errors.ValidationError)
        }
      })

      it('should fail with wrong parameters types', async () => {
        expect.assertions(1)
        try {
          await broker.call(`${serviceName}.create`, dbService.makeItemWithWrongParamsTypes(1))
        } catch (err) {
          expect(err).toBeInstanceOf(Errors.ValidationError)
        }
      })

    })

    describe('Test \'list\' action', () => {

      it('should return all items ', async () => {
        expect.assertions(1)

        await dbService.create(1)
        await dbService.create(2)

        const res: ListDBActionResponse<ItemSchema> = await dbService.list()
        expect(res.rows).toIncludeSameMembers([
          dbService.makeItemExpectation(1),
          dbService.makeItemExpectation(2),
        ])
      })

    })

    describe('Test \'get\' action', () => {

      it('should get an existing item ', async () => {
        expect.assertions(1)

        await dbService.create(1)
        const zombie = await dbService.getFirst()

        const deleteRes = await broker.call(`${serviceName}.get`, { id: zombie._id })
        expect(deleteRes).toEqual(dbService.makeItemExpectation(1))
      })

      it('should fail on wrong id', async () => {
        expect.assertions(1)
        try {
          await broker.call(`${serviceName}.get`, { id: 'not-existing-id' })
        } catch (error) {
          expect(error.code).toBe(404)
        }
      })

    })

    describe('Test \'update\' action', () => {

      it('should update an existing item ', async () => {
        expect.assertions(1)

        await dbService.create(1)
        const zombie = await dbService.getFirst()

        // @TODO separate action for update
        const firstUpdateRes = await broker.call(`${serviceName}.update`, { id: zombie._id, ...dbService.makeItem(2) })
        expect(firstUpdateRes).toEqual(dbService.makeItemExpectation(2))
      })

      it('should fail on wrong id ', async () => {
        expect.assertions(1)

        try {
          await broker.call(`${serviceName}.update`, { id: 'not-existing-id', ...dbService.makeItem(2) })
        } catch (error) {
          expect(error.code).toBe(404)
        }
      })

    })

    describe('Test \'delete\' action', () => {

      it('should delete an existing item ', async () => {
        expect.assertions(1)

        await dbService.create(1)
        const zombie = await dbService.getFirst()

        const deleteRes = await broker.call(`${serviceName}.remove`, { id: zombie._id })
        expect(deleteRes).toBe(1)
      })

      it('should fail on wrong id ', async () => {
        expect.assertions(1)

        try {
          await broker.call(`${serviceName}.remove`, { id: 'not-existing-id' })
        } catch (error) {
          expect(error.code).toBe(404)
        }
      })

    })

  })


}

export default makeDbServiceTests