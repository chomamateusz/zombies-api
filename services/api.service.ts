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
        'GET zombies/:zombieId/items': 'zombie-items-middleware.get',
        'GET zombies/:zombieId/items/:id': 'zombie-items-middleware.get',
        'POST zombies/:zombieId/items': 'zombie-items-middleware.create',
        'PUT zombies/:zombieId/items/:id': 'zombie-items-middleware.update',
        'DELETE zombies/:zombieId/items/:id': 'zombie-items-middleware.remove',
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
