var Path = require('path')
var Hapi = require('hapi')
var Good = require('good')

var doors = {}

var server = new Hapi.Server()
server.connection({
  port: process.env.PORT || 3000,
  state: { strictHeader: false },
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'public')
    }
  }
})

server.views({
  engines: { html: require('hapi-dust') },
  path: Path.join(__dirname, 'templates')
})

server.route([
  {
    method: 'GET',
    path: '/door/{doorID}',
    handler: function(request, reply) {
      reply.view('home', { doorID: request.params.doorID })
    }
  },
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: { path: Path.join(__dirname, 'public') }
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: function(request, reply) {

    }
  },
  {
    method: 'POST',
    path: '/ping/{id}',
    config: {
      payload: {
        output: 'data',
        parse: true
      },
      handler: function(request, reply) {
        var id = request.params.id
        var door = doors[id] || (doors[id] = {})
        door.state = request.payload.state

        reply({ command: door.command || null })
        door.command = undefined
      }
    }
  },
  {
    method: 'GET',
    path: '/state/{id}',
    handler: function(request, reply) {
      var id = request.params.id
      var state = doors[id] && doors[id].state || null
      reply({ state: state })
    }
  },
  {
    method: 'GET',
    path: '/close/{id}',
    handler: function(request, reply) {
      var id = request.params.id
      doors[id].command = 'close'
      reply({ toggled: true })
    }
  },
  {
    method: 'GET',
    path: '/open/{id}',
    handler: function(request, reply) {
      var id = request.params.id
      doors[id].command = 'open'
      reply({ toggled: true })
    }
  }
])

server.register({
  register: Good,
  options: {
    reporters: [{
      reporter: require('good-console'),
      args: [{ log: '*', response: '*' }]
    }]
  }
}, function(err) {
  if (err) throw err

  server.start(function() {
    console.log('Server running at: %s', server.info.uri)
  })
})
