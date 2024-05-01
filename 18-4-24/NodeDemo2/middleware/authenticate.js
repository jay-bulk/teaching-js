// Author: Rhett Bulkley
import jwt from 'jsonwebtoken'
import { execQuery } from '../dbConnExec.js'

const privateKey = process.env.JWT_PRIVATE_KEY

export const auth = async (req, res, next) => {
    console.log('GET AUTH', req.header('Authorization'))
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decodedJWT = jwt.verify(token, privateKey)
        const contactPk = decodedJWT.pk
        const checkTokenQuery = `Select ContactPK, FirstName, LastName, Email
                                    FROM Contact
                                    WHERE ContactPK = ${contactPk} and token = '${token}'`
        const contact = await execQuery(checkTokenQuery)

        if (contact[0]) {
            req.contact = contact[0]
            next()
        } else {
            res.status(401).send('Not Authorized')
        }
    }
    catch (err) {
        res.status(401).send('Not Authorized')
    }
}

