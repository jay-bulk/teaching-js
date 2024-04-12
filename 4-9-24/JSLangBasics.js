// Author: Rhett Bulkley
"use strict";

// alert('Testing 1, 2, 3');
// console.log('Look Tata, I can do JS')
// let you = prompt("What's your name?");
// console.log(`Nice to meet you ${you}`);
const myFavMovie = "Harry Potter";
//console.log(myFavMovie)
//console.log(myFavMovie.length)
//console.log(myFavMovie.concat(" is my favorite movie"))
// document.getElementById("testJS").innerHTML = myFavMovie.toUpperCase() + " - One of the most successful movie franchise of all time";
let myNum = 20;
myNum += 30;
const fixedNum = 3.14;
// function sayHi() {
// console.log("Hi")
// }
// sayHi();
// let sayHello = function() {
// console.log("Hello")
// }
// sayHello()
//
// let sayHiToMe = function(name = "John") {
// console.log("Hi there" + name);
// }
//
// sayHiToMe("Joseph")
// sayHiToMe()
//
//let favShows = ["Friends", "Big Bang Theory", "How I Met Your Mother", "Walk The Line"]
//console.log(favShows)
//console.log(favShow[2])
//
//let favFoods = new Array("Sushi", "Biryani", "Pulao", "Svickova");
//console.log(favFoods)
//
//favFoods.push("Idili")
//console.log(favFoods)
//favFoods[2] = "Thai Fried Rice"
//console.log(favFoods)
//favFoods.splice(3,0,"Trdelni", "Kaju Katli")
//console.log(favFoods)
//favFoods.pop()
//console.log(favFoods)
//
//for (let i = 0; i < favFoods.length; i++) {
// console.log(favFoods[i])
//}
//
//for (let food of favFoods) {
//console.log(food)
//}
//favFoods.foreach(function (food) {
//console.log(food)
//})
//function listFood(food){
//console.log(food)
//}
//favFoods.forEach(listFood)
//favFoods.forEach(food => console.log(food))
//
let destination = { city: "Athens", country: "Greece", continent: "Europe" };
console.log(destination);

for (let prop in destination) {
  console.log(desination[prop]);
}

let dest = {};
dest["city"] = "Paris";
dest["country"] = "France";
dest["continent"] = "Europe";

console.log(dest);

class Sport {
  #sportName;
  #sportField;
  #teamSize;

  constructor(name, field, size) {
    this.#sportName = name;
    this.#sportField = field;
    this.#teamSize = size;
  }

  get sportName() {
    return this.#sportName;
  }

  set sportName(name) {
    this.#sportName = name;
  }

  printSport() {
    return `${this.#sportName} is played on ${this.#sportField} by ${this.#teamSize} players.`;
  }
}

let aSport = new Sport("Tennis", "Court", 2);
// console.log(aSport)
// console.log(aSport.printSport())

// aSport.sportName = "Pickleball"
// console.log(aSport.printSport())

let sports = [
  { name: "Tennis", field: "Court", size: 4 },
  { name: "Cricket", field: "Pitch", size: 11 },
  { name: "Kabadi", field: "Court", size: 7 },
];

// console.log(sports)
// console.log(sports[1].field)

for (let i = 0; i < sports.length; i++) {
  if (sports[i].size >= 5) {
    console.log(sports[i].name);
  }
}

sports.forEach((aSport) => (aSport.size >= 4 ? console.log(aSport.name) : ""));
