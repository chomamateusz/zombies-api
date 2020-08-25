import ZombieItemsService, { ZombieItemSchema } from '../../../services/zombie-items.service'
import makeDbServiceTests, { AdditionalTestsParams } from './dbServiceTests'

type ZombieItemSchemaWithoutId = Omit<ZombieItemSchema, '_id'>

const makeItem = (index: number): ZombieItemSchemaWithoutId => ({
  zombieId: '123',
  itemId: `id-${index}`,
})
const makeItemWithWrongParamsNames = (index: number): object => ({
  name: 'Item',
})
const makeItemWithWrongParamsTypes = (index: number): object => ({
  zombieId: 1,
  itemId: 1,
})

const additionalTests = ({ dbService }: AdditionalTestsParams) => {

  describe('Additional assumptions', () => {

    it('zombie can have a maximum of 5 items', async () => {
      expect.assertions(1)

      await dbService.create(1)
      await dbService.create(2)
      await dbService.create(3)
      await dbService.create(4)
      await dbService.create(5)

      try {
        await dbService.create(5)
      } catch (error) {
        expect(error.code).toBe(403)
      }
    })

  })

}

makeDbServiceTests<ZombieItemSchema>({
  service: ZombieItemsService,
  makeItem,
  makeItemWithWrongParamsNames,
  makeItemWithWrongParamsTypes,
  additionalTests,
})
