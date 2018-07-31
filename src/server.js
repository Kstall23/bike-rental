const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const epilogue = require('epilogue')
const OktaJwtVerifier = require('@okta/jwt-verifier')
const Nexmo = require('nexmo')
const { API_KEY, API_SECRET, NUMBER } = require('../config/dev.env')

const nexmo = new Nexmo({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
}, {debug: true});

const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: '0oafsc1rp991wJMJ90h7',
  issuer: 'https://dev-595847.oktapreview.com/oauth2/default'
})

let app = express()
app.use(cors())
app.use(bodyParser.json())

app.post('/send-sms', (req, res) => {
  console.log(req.body)
  const toNumber = req.body.number;
  const text = req.body.text;
  nexmo.message.sendSms(
    NUMBER, toNumber, text, {type: 'unicode'},
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send(data);
        // Optional: add socket.io -- will explain later
      }
    }
  );
});

// verify JWT token middleware
app.use((req, res, next) => {
  // require every request to have an authorization header
  if (!req.headers.authorization) {
    return next(new Error('Authorization header is required'))
  }
  let parts = req.headers.authorization.trim().split(' ')
  let accessToken = parts.pop()
  oktaJwtVerifier.verifyAccessToken(accessToken)
    .then(jwt => {
      req.user = {
        uid: jwt.claims.uid,
        email: jwt.claims.sub
      }
      next()
    })
    .catch(next) // jwt did not verify!
})

let database = new Sequelize({
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
})

// database
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

// Define our Share model
// id, createdAt, and updatedAt are added by sequelize automatically
let Share = database.define('shares', {
  costToRent: Sequelize.INTEGER,
  uploadedPicture: Sequelize.TEXT,
  shortDescription: Sequelize.STRING,
  longDescription: Sequelize.TEXT,
  bikeType: Sequelize.STRING,
  address: Sequelize.STRING,
  city: Sequelize.STRING,
  zipcode: Sequelize.INTEGER,
  dateOne: Sequelize.DATE,
  dateTwo: Sequelize.DATE
})

// Initialize epilogue
epilogue.initialize({
  app: app,
  sequelize: database
})

// Create the dynamic REST resource for our Share model
let userResource = epilogue.resource({
  model: Share,
  endpoints: ['/shares', '/shares/:id'],
  sort: {
    param: 'orderby',
    attributes: [ 'bikeType' ]
  }
})

// Resets the database and launches the express app on :8081
database
  .sync({ force: true })
  .then(() => {
    app.listen(8081, () => {
      console.log('listening to port localhost:8081')
    })
  })
