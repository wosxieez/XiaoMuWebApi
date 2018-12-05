const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const Sequelize = require('sequelize')
const config = require('./config')
const app = new Koa()

app.use(bodyParser())

var sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      idle: 30000
    }
  }
)

var User = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.STRING(50),
      primaryKey: true
    },
    username: Sequelize.STRING(100),
    password: Sequelize.STRING(100)
  },
  {
    timestamps: false
  }
)

//------------------------------------------------------------------------------------------
//
// 注册接口
//
//------------------------------------------------------------------------------------------

router.post('/register', async (ctx, next) => {
  var username = ctx.request.body.username
  var password = ctx.request.body.password

  try {
    var oldUser = await User.findAll({
      where: {
        username: username
      }
    })

    if (oldUser && oldUser.length > 0) {
      ctx.response.type = 'json'
      ctx.response.body = { result: -2, message: '用户已经存在' }
    } else {
      var newUser = await User.create({
        username: username,
        password: password
      })

      ctx.response.type = 'json'
      ctx.response.body = { result: 0, message: '注册成功' }
    }
  } catch (error) {
    ctx.response.type = 'json'
    ctx.response.body = { result: -1, message: '注册失败' }
  }
})

//------------------------------------------------------------------------------------------
//
// 登录接口
//
//------------------------------------------------------------------------------------------

router.post('/login', async (ctx, next) => {
  var username = ctx.request.body.username
  var password = ctx.request.body.password

  try {
    var oldUser = await User.findAll({
      where: {
        username: username,
        password: password
      }
    })

    if (oldUser && oldUser.length > 0) {
      ctx.response.type = 'json'
      ctx.response.body = { result: 0, message: '登录成功' }
    } else {
      ctx.response.type = 'json'
      ctx.response.body = { result: -1, message: '登录失败' }
    }
  } catch (error) {
    ctx.response.type = 'json'
    ctx.response.body = { result: -1, message: '登录失败' }
  }
})

// add router middleware:
app.use(router.routes())

app.listen(3000)
console.log('app started at port 3000...')
