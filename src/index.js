const STATUS = {
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
  PENDING: "PENDING",
}

// TODO: refactor
class MyPromise {
  #status = STATUS.PENDING
  #thenFuncList = []
  #catchFuncList = []
  #data = null
  #error = null

  static defaultCatch = (e) => {
    console.log("uncaughtException", e)
  }

  constructor(initFunc) {
    initFunc(this.#resolveThis, this.#rejectThis)
  }

  static resolve = (data) => {
    return new MyPromise((r) => r(data))
  }

  static reject = (err) => {
    return new MyPromise((_, r) => r(err))
  }

  then(thenFunc, catchFunc) {
    const self = this
    if (arguments.length > 0 && typeof thenFunc !== "function") {
      thenFunc = (a) => {
        return a
      }
    }

    if (arguments.length > 1 && typeof catchFunc !== "function") {
      catchFunc = (a) => {
        throw a
      }
    }

    const p = new MyPromise((resolveNext, rejectNext) => {
      const nextThen = (data) => {
        let nextReturn
        try {
          nextReturn = thenFunc(data)
        } catch (e) {
          rejectNext(e)
        }

        if (p === nextReturn) {
          rejectNext(new TypeError("1"))
        }

        try {
          const then = !!nextReturn && nextReturn.then

          if (then && typeof then === "function") {
            if (p === nextReturn) {
              rejectNext(new TypeError("1"))
            }
            then.call(nextReturn, resolveNext, rejectNext)
          } else {
            resolveNext(nextReturn)
          }
        } catch (e) {
          rejectNext(e)
        }
      }

      const nextCatch = (error) => {
        if (!catchFunc) {
          return rejectNext(error)
        }

        let nextReturn
        try {
          nextReturn = catchFunc(error)
        } catch (e) {
          rejectNext(e)
        }

        if (p === nextReturn) {
          rejectNext(new TypeError("1"))
        }

        try {
          const then = !!nextReturn && nextReturn.then

          if (then && typeof then === "function") {
            if (p === nextReturn) {
              rejectNext(new TypeError("1"))
            }

            then.call(nextReturn, resolveNext, rejectNext)
          } else {
            resolveNext(nextReturn)
          }
        } catch (e) {
          rejectNext(e)
        }
      }

      if (self.#status === STATUS.RESOLVED) {
        setTimeout(nextThen, 0, self.#data)
      } else if (self.#status === STATUS.PENDING) {
        self.#thenFuncList.push(nextThen)
        self.#catchFuncList.push(nextCatch)
      } else if (self.#status === STATUS.REJECTED) {
        setTimeout(nextCatch, 0, self.#error)
      }
    })

    return p
  }

  #resolveFuncItems = () => {
    this.#thenFuncList.forEach((func) => {
      func(this.#data)
    })
  }

  #resolveThis = (data) => {
    setTimeout(() => {
      if (this.#status === STATUS.PENDING) {
        this.#data = data
        this.#status = STATUS.RESOLVED
        this.#resolveFuncItems()
      }
    })
  }

  #rejectFuncItems = () => {
    if (!this.#thenFuncList.length && !this.#catchFuncList.length) {
      // throw this.#error
      MyPromise.defaultCatch(this.#error)
      return
    }

    this.#catchFuncList.forEach((func) => {
      func(this.#error)
    })
  }

  #rejectThis = (error) => {
    setTimeout(() => {
      if (this.#status === STATUS.PENDING) {
        this.#error = error
        this.#status = STATUS.REJECTED
        this.#rejectFuncItems()
      }
    })
  }
}

module.exports = MyPromise

