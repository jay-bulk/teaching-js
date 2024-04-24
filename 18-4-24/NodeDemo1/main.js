//Author: Rhett Bulkley
import mod from "./myModule.js";
import { sayHello, addTwoNumbers as addTwo } from './myOtherModule.js'
import fs from 'node:fs'
import oneLinerJoke from 'one-liner-joke'

function sayHi() {
  console.log("Hi");
}
sayHi();

console.log(mod());
console.log(addTwo(1, 1));
console.log(sayHello('John'));

fs.writeFile('myFile.txt', 'Hey there', () => {
  console.log('File written')
});

const randomJoke = oneLinerJoke.getRandomJoke();

console.log(randomJoke)