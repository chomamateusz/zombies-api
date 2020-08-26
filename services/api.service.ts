import ApiGateway from 'moleculer-web'

export default {
  name: 'api',
  mixins: [ApiGateway],
  settings: {
    port: process.env.PORT || 3000,
    routes: [{
      path: '/api',
      whitelist: [
        '**',
      ],
      autoAliases: true,

      aliases: {
        'REST zombies': 'zombies',
        'REST zombies/:zombieId/items': 'zombie-items-middleware',
      },

      bodyParsers: {
        json: {
          strict: false,
          limit: '1MB',
        },
      },

      mappingPolicy: 'restrict',

      logging: true,
    }],

  },
}
