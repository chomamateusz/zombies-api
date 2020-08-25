import { ServiceSchema } from 'moleculer'
import RequestCacheMixin from '../mixins/request-cacher.mixin'

export interface RateSchema {
  _id: string;
  name: string;
  price: number;
}

const RatesService: ServiceSchema = {

  name: 'rates',

  mixins: [
    RequestCacheMixin({
      name: 'Rates',
      url: 'http://api.nbp.pl/api/exchangerates/tables/C/today/',
      updatePeriod: 24 * 60 * 60 * 1000,
    }),
  ],

}

export default RatesService
