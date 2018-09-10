'use strict'

module.exports.memoize = memoize

function memoize(func) {
    const memory = new Map()
    return (id, cb) => {
        const obj = memory.get(id)
        if (obj) {
            console.log("Object Returned By Cache")
            return cb(null, obj)
        }
        else {
            func(id, (err, data) => {
                if(err) return cb(err)
                memory.set(id, data)
                console.log("Object Returned By Request")
                cb(null, data)
            })
        }
    }
}