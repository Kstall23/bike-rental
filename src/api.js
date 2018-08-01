import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8081/',
  json: true
})

export default {
  async execute (method, resource, data) {
    // inject the accessToken for each request
    let accessToken = await Vue.prototype.$auth.getAccessToken()
    return client({
      method,
      url: resource,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(req => {
      return req.data
    })
  },
  getSharesByBikeType (bikeType, dateOne, dateTwo) {
    let url = ''
    if (bikeType && dateOne && dateTwo) {
      url = `/shares?bikeType=${bikeType}&dateOne=${dateOne}&dateTwo=${dateTwo}`
    } else if (dateOne && dateTwo) {
      url = `/shares?dateOne=${dateOne}&dateTwo=${dateTwo}`
    } else if (bikeType) {
      url = `/shares?bikeType=${bikeType}`
    } else {
      url = `/shares`
    } return this.execute('get', url)
    // http://localhost:8081/shares?sort=-bikeType
  },
  getShares () {
    return this.execute('get', '/shares')
  },
  getShare (id) {
    console.log('test')
    return this.execute('get', `/shares/${id}`)
  },
  createShare (data) {
    return this.execute('post', '/shares', data)
  },
  updateShare (id, data) {
    return this.execute('put', `/shares/${id}`, data)
  },
  deleteShare (id) {
    return this.execute('delete', `/shares/${id}`)
  },
  sendSms (data) {
    return this.execute('post', `/send-sms`, data)
  }
}
