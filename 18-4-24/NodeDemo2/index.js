// Author: Rhett Bulkley
import express from 'express'
import { execQuery } from './dbConnExec.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
 
const app = express()

app.use(express.json())
const PORT = 1340
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
}) 

app.get('/', (req, res) => {
  res.send('Look ma, I can do Node Rest API')
})

app.get('/pa', (req, res) => {
  res.send('Look pa, I am an ace with Node Rest API')
})

app.get('/films', (req, res) => {
  const query = `select filmpk, MovieTitle, PitchText, AmountBudgeted,
                      summary, DateInTheaters, rating
                      from film inner join FilmRating
                      on ratingpk = RatingFK
                      order by MovieTitle`;
  execQuery(query)
  .then(result => {
    res.status(200).send(result)
  })
  .catch(err => {
    console.log(err)
    res.status(500).send()
  })
})

app.get('/films/:id', (req, res) => {
  if (req.params.id.match(/^-?\d+$/)) {
  const query = `select filmpk, MovieTitle, PitchText, AmountBudgeted,
                      summary, DateInTheaters, rating
                      from film inner join FilmRating
                      on ratingpk = RatingFK
                      where filmpk = ${req.params.id}`;
  execQuery(query)
  .then(result => {
    if (result.length === 1) {
    res.status(200).send(result[0])
    } else {
      res.status(404).send('Bad Request')
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).send()
  })
  } else {
    res.status(404).send('Invalid path parameter')
  }
})

app.post('/register', async (req, res) => {
  let firstName = req.body.firstName
  let lastName = req.body.lastName
  const email = req.body.email
  const userPassword = req.body.userPassword

  if (!firstName || !lastName || !email || !userPassword) {
    return res.status(400).send('Bad Request Missing Item')
  }
  firstName = firstName.replace("'", "''")
  lastName = lastName.replace("'", "''")

  const emailCheckQuery = `Select email from contact where email = '${email}'`;

  const duplicateEmail = await execQuery(emailCheckQuery)
  if (duplicateEmail[0]) {
    return res.status(400).send('Please enter a different email')
  }

  const hashedPassword = bcrypt.hashSync(userPassword)

  const userInsert = `INSERT INTO contact(FirstName, LastName, Email, UserPassword) 
                        VALUES('${firstName}', '${lastName}', '${email}', '${hashedPassword}')`
  await execQuery(userInsert)
  .then(() => res.status(201).send('Registration Successful'))
  .catch((err) =>  {
    console.error(err)
    return res.status(500).send('Registration Unsuccessful. Please try again later')
  })
})

app.post('/login', async (req, res) => {

  const email = req.body.email
  const userPassword = req.body.userPassword
  const emailCheckQuery = `Select * FROM contact where email = '${email}'`

  let result;

  try {
    result = await execQuery(emailCheckQuery)
  } catch (err) {
    console.error('Login error', err)
    return res.status(500).send()
  }
  const contact = result[0]

  if (!bcrypt.compareSync(userPassword, contact.UserPassword)) {
    return res.status(401).send('Invalid Credentials')
  }

  const token = jwt.sign({pk: contact.ContactPK}, process.env.JWT_PRIVATE_KEY, {expiresIn: '30 minutes'})

  const setTokenQuery = `UPDATE contact
                        SET token = '${token}' WHERE ContactPK = '${contact.ContactPK}'`

  try {
    await execQuery(setTokenQuery)

    res.status(200).send({
      token: token,
      contact: {
        FirstName: contact.FirstName,
        LastName: contact.LastName,
        Email: contact.Email,
        ContactPK: contact.ContactPK
      }
    })
  } catch (err) {
    console.error(err, 'Failed to get token')
    res.status(500).send()
  }
})