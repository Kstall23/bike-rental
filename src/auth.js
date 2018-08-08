const OktaAuth = require('@okta/okta-auth-js')
const authClient = new OktaAuth({url: 'https://dev-563731.oktapreview.com', issuer: 'default'})

// 0oafw2m5winCaBnXv0h7

export default {
  login (email, pass, cb) {
    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (cb) cb(new Error('false'), true)
      this.onChange(true)
      return
    }
    return authClient.signIn({
      username: email,
      password: pass
    }).then(response => {
      if (response.status === 'SUCCESS') {
        localStorage.token = response.sessionToken
        if (cb) cb(new Error('false'), true)
        this.onChange(true)
      }
    }).fail(err => {
      console.error(err.message)
      if (cb) cb(new Error('false'))
      this.onChange(false)
    })
  },

  getToken () {
    return localStorage.token
  },

  logout (cb) {
    delete localStorage.token
    if (cb) cb()
    this.onChange(false)
  },

  loggedIn () {
    return !!localStorage.token
  },

  onChange () {}
}
