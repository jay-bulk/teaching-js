// Author: Rhett Bulkley
import express from 'express'
import { execQuery } from './dbConnExec.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { auth } from './middleware/authenticate.js'
 
const app = express()

app.use(express.json())
const PORT = 1340
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
}) 

app.get('/', (req, res) => {
  console.log('GET /', req.headers)
  res.send('Look ma, I can do Node Rest API')
})

app.get('/pa', (req, res) => {
  console.log('GET /pa', req.headers)
  res.send('Look pa, I am an ace with Node Rest API')
})

app.get('/films', (req, res) => {
  console.log('GET /films', req.headers)
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
  console.log('GET /films/:id', req.headers)
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
  console.log('POST /register', req.headers)
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

  console.log('POST /login', req.headers)
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

app.post('/reviews/add', auth, async (req, res) => {
  console.log('POST reviews/add', req.headers)
  try {
    const filmFK = req.body.filmFK
    let summary = req.body.summary
    const rating = req.body.rating

    if (!filmFK || !summary || !rating || !Number.isInteger(rating)) {
      res.status(400).send('Bad Request')
    }

    summary = summary.replace("'", "''")

    const insertReview = `Insert into FilmReview(reviewsummary, reviewrating, filmFK, contactFK)
                        Output inserted.ReviewPK, inserted.ReviewSummary, inserted.ReviewRating, inserted.FilmFK
                        VALUES ('${summary}', ${rating}, ${filmFK},${req.contact.ContactPK})`
    const data = await execQuery(insertReview)
    res.status(201).send(data[0])
  } catch (err) {
    console.log('Error in POST /reviews/add', err)
    res.status(500).send('Internal Server Error')
  }



})