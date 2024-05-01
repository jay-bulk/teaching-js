// Author: Rhett Bulkley
import jwt from 'jsonwebtoken'
import { execQuery } from '../dbConnExec.js'

const privateKey = process.env.JWT_PRIVATE_KEY

export const auth = async (req, res, next) => {
    console.log('GET AUTH', req.header('Authorization'))
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decodedJWT = jwt.verify(token, privateKey)
        const userPk = decodedJWT.pk
        const checkTokenQuery = `Select UserID, UName, FullName
                                    FROM NodeLoginInfo 
                                    WHERE UserID = ${userId} and token = '${token}'`
        const userInfo = await execQuery(checkTokenQuery)

        if (userInfo[0]) {
            req.user = userInfo[0]
            next()
        } else {
            res.status(401).send('Not Authorized')
        }
    }
    catch (err) {
        res.status(500).send('Server Error')
    }
}
