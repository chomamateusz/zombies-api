import ZombiesService, { ZombieSchema } from '../../../services/zombies.service'
import makeDbServiceTests from './dbServiceTests'

type ZombieSchemaWithoutId = Omit<ZombieSchema, '_id'>

const makeItem = (index: number): ZombieSchemaWithoutId => ({
  name: `Zombie ${index}`,
})
const makeItemWithWrongParamsNames = (index: number): object => ({
  firstName: `Zombie ${index}`,
})
const makeItemWithWrongParamsTypes = (index: number): object => ({
  name: {},
})

makeDbServiceTests<ZombieSchema>({
  service: ZombiesService,
  makeItem,
  makeItemWithWrongParamsNames,
  makeItemWithWrongParamsTypes,
})