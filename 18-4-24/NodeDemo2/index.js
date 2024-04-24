// Author: Rhett Bulkley
import express from 'express'
import { execQuery } from './dbConnExec.js'
 
const app = express()

app.user(express.json())
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
  let email = req.body.email
  let userPassword = req.body.userPassword

  if (!firstName || !lastName || !email || !userPassword) {
    return res.status(400).send('Bad Request Missing Item')
  }
  firstName = firstName.replace("'", "''")
  lastName = lastName.replace("'", "''")
  email = email.replace("'", "''")

})