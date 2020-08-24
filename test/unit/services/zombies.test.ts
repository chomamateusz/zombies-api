import ZombiesService, { ZombieSchema } from '../../../services/zombies.service'
import makeDbServiceTests from './dbServiceTests'

type ZombieSchemaWithoutId = Omit<ZombieSchema, '_id'>

const makeItem = (index: number): ZombieSchemaWithoutId => ({
  name: `Zombie ${index}`,
  items: [],
})
const makeItemWithWrongParamsNames = (index: number): object => ({
  name: `Zombie ${index}`,
})
const makeItemWithWrongParamsTypes = (index: number): object => ({
  name: `Zombie ${index}`,
  items: {},
})

makeDbServiceTests<ZombieSchema>({
  service: ZombiesService,
  makeItem,
  makeItemWithWrongParamsNames,
  makeItemWithWrongParamsTypes,
})