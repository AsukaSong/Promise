var promisesAplusTests = require("promises-aplus-tests")
var Promise = require('./index.js')

promisesAplusTests(
  {
    deferred() {
      let resolve,
        reject,
        promise = new Promise((res, rej) => {
          resolve = res
          reject = rej
        })

      return {
        resolve,
        reject,
        promise,
      }
    },
  },
  function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
    if (err) {
      console.log(err)
    } else {
      console.log("success")
    }
  }
)

