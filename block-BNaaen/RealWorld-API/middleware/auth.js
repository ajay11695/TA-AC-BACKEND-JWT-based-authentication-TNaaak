let jwt = require('jsonwebtoken')

module.exports = {
    varifyToken: async (req, res, next) => {
        let token = req.headers.authorization
        try {
            if (token) {
                let result = await jwt.verify(token, 'thisisasecret')
                req.user = result
                next()
            } else {
                res.status(400).json({ message: 'Token required' })
            }

        } catch (error) {
            next(error)
        }

    },


    userInfo: async (req, res, next) => {
        let token = req.headers.authorization
        try {
            if (token) {
                let payload = await jwt.verify(token, 'thisisasecret')
                req.user = payload
                return next()
            } else {
                req.user = null
                next()
            }
        } catch (error) {

        }
    }
}