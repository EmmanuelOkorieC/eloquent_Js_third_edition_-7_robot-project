# Eloquent Javascript, 3rd Edition: A modern Introduction to programming
An overview of the mail delivery robot project in chapter seven of the ebook [Eloquent Javascript, 3rd Edition](https://eloquentjavascript.net/Eloquent_JavaScript.pdf) by Marijn Haverbeke with solution to exercises 

## Overview
### Chapter Seven: Project: A Robot

In this chapter, we worked on a little Project, [a mail delivery Robot](https://eloquentjavascript.net/code/chapter/07_robot.js). This robot picks up a package from a location and delivers it to a specified address. 

To get this robot working, we first define a small village where it can move through to accomplish our goal. This village is **Meadowfield** and it isn't very big. It has 11 places with 14 roads between them. we represent this village as an array of roads.

```javascript
const roads = [
    "Alice's House-Bob's House", "Alice's House-Cabin",
    "Alice's House-Post Office", "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop", "Marketplace-Farm",
    "Marketplace-Post Office", "Marketplace-Shop",
    "Marketplace-Town Hall", "Shop-Town Hall"
]
```
These roads structure out a map that looks somewhat like this
![image](https://i.ibb.co/55VchPk/FARM.png)

It is not very easy working with an array of strings. Instead we need a well defined data structure that tells us what destinations we can reach from a given place. 

This data structure would be a *map object* (an object that has no prototype) that takes each road as property *name* and an array of what destinations we can reach from that road as it's *value*. 

This data structure with our network of roads is often called a *graph*. The function `buidGraph` takes our array of roads as argument and helps us build this "graph"

```javascript
function buildGraph(roads) {
   let graph = Object.create(null)
        function addEdge(from, to) {
            if(!graph[from]) {
              graph[from] = [to]
            }
            else {
                graph[from].push(to)
            }
        }
    for(let [from, to] of roads.map(c => c.split("-"))) {
        addEdge(from, to)
        addEdge(to, from)
    }
    return graph
}

const roadGraph = buildGraph(roads)
```
 The local binding `graph` in `buildGraph` gets assigned our *map object* and the closure `addEdge` helps us build our network of roads. 
 
 But before we call `addEdge` in the `buildGraph` function, we need to modify the array `roads` passed in as argument. Each road follows the format "Start-End" but we want to be able to reference our "Start" and "End" separately so we map through every road string, splitting them(using the string method `split`) on the occurence of a hyphen `"-"`  which produces a two-element array that looks something like this
 ```
 [
    ["Alice's House", Bob's House"], ["Alice's House, Cabin"],
    ["Alice's House, Post Office"], ["Bob's House, Town Hall"],
    ["Daria's House, Ernie's House"], ["Daria's House, Town Hall"],
    ["Ernie's House, Grete's House"], ["Grete's House, Farm"],
    ["Grete's House, Shop"], ["Marketplace, Farm"],
    ["Marketplace, Post Office"], ["Marketplace, Shop"],
    ["Marketplace, Town Hall"], ["Shop, Town Hall"]
]
 ```
 
 Next, we loop through this mapped array, destructuring each element to access "Start" (assigned to `from` in the function) and "End" (assigned to `to` in the function). 
 
 On each iteration, we pass each road's "Start" and "End" as arguments to our `addEdge` function. we also pass them as arguments in inverse order (which indicates that for each road we can go from  "Start" to "End" and from "End" to "Start"). 
 
The `addEdge` function checks if  "Start" exists as a property in the object `graph`. If it doesn't, it simply creates it and it's value will be a new array object with "End" added to it. But if it does, then it's the case of another place we can get to from "Start", so we simply add this place to our existing array using the array method `push`. 

After iterating, we return the`graph` object.

Calling `buildGraph` passing in `roads` as argument will return a graph that looks something like this
```javascript
{
"Alice's House": ["Bob's House", "Cabin", "Post Office"],
"Bob's House": ["Alice's House", "Town Hall"],
Cabin: ["Alice's House"],
"Post Office": ["Alice's House", "Marketplace"],
"Town Hall": ["Bob's House", "Daria's House", "Marketplace", "Shop"],
"Daria's House": ["Ernie's House", "Town Hall"],
"Ernie's House": ["Daria's House", "Grete's House"],
"Grete's House": ["Ernie's House", "Farm", "Shop"],
Farm: ["Grete's House", "Marketplace"],
Shop: ["Grete's House", "Marketplace","Town Hall"],
Marketplace: ["Farm", "Post Office", "Shop", "Town Hall"]
}
```

We will assign this graph to a binding `roadGraph` so we can reference it easily in other sections of our code.

#### Robot Simulation
Our robot will be moving around the village with the parcels in various places, each addressed to some other place. The robot picks up the parcels when it comes to them and delivers them when it arrives at their destination. The function `runRobot` in this chapter represents a simulation of our mail delivery robot. It takes three arguments, a 'VillageState' object, a robot function and a memory value

#### The "VillageState" Object
The 'VilageState' Object is an instance of the class `VillageState` which we define in this chapter. It holds two properties, `place` that stores our robot's current location and `parcels` which is an array of objects - each with a pick-up adddress (*assigned to the property* `place`) and a delivery address (*assigned to the property* `address`), representing our undelivered parcels. It also has a `move` method in it's prototype (*that we define in it's class*) that takes a destination to move in as argument and returns a new updated instance of our class.
```javascript
class villageState {
    constructor(place, parcels) {
        this.place = place
        this.parcels = parcels
    }

    move(destination) {
        if(!roadGraph[this.place].includes(destination)) {
            return this
        }
        else {
            let parcels = this.parcels.map(p => {
                if (p.place !== this.place) return p
                else {
                    return {place: destination, address: p.address}
                }}).filter(p => p.place !== p.address)
                   return new villageState(destination, parcels)
        }
    }
}
```

The `move` method uses the graph object `roadGraph` to check for all places reachable from the robot's current location -from `"Post Office"` for example, it can move to `"Alice's House"` and `"Marketplace"`. Then it checks if one of those places/place is the `destination` we passed in as argument (using the array method `includes`). **If it is not** (as in our `if` statement), then it is not a valid move and it simply returns the old instance of our class. **Else** it progresses to update the parcels and return a new instance of the class.

It first maps through each parcel and checks if the pick-up address (assigned to the property `place`) is the same as the robot's current location (`this.place`). **If it is not**, it returns the parcel (*we do not update it*) as it means the robot has not picked it up yet. **Else**, it updates the pick-up address (to become the robot's new place `destination`) to show that the robot has picked it up and is now moving along with it. For every case where the updated pick-up address is the same as the delivery address (assigned to `address`), it means the parcel has gotten to it's delivery location and it gets removed from the collection of parcels using the array method `filter`. 

It then assigns the result of updating the parcels to the local binding `parcels` and returns an updated instance of the class passing `destination` as it's current location and `parcels` as it's new parcels. 
```javascript
let first = new villageState(
'Post Office', 
[{place: "Post Office", address: "Alice's House"}]
)
let next = first.move(`Alice's House`)
console.log(next.place) //outputs Alice's House
console.log(next.parcels) //outputs []
```

The move to "Alice's House" starts off by checking if Alice's House is reachable from the Post Office. Yes it is! so it's a valid move. Then it updates the parcel checking if the pick-up address is the same as the robot's current location. Yes it is! so it changes the pick-up address to Alice's House to show it is now moving along with the parcel. "ding ding" Alice's House is the delivery address so it means the parcel has gotten to it's destination and it is removed from the array. Then it creates a new instance of our class passing in Alice's House as it's current location and the updated parcels as it's parcels - In this case none will be left as the only parcel has been delivered to Alice's House

To run our simulation with the function `runRobot`, we pass in a "VillageState" Object with some parcels in it. The static method `random` defined in the class `VillageState` helps us create this object. (P.s - we don't define it in the class in this project but instead we directly add it to the constructor)
```javascript
function randomPicker(array) {
    let pick = Math.floor(Math.random() * array.length)
    return array[pick]
}

villageState.random = function(parcelCount = 5) {
    let parcels = []
    for (let i = 0; i < parcelCount; i++) {
        let place = randomPicker(Object.keys(roadGraph))
        let address;
        do {
           address = randomPicker(Object.keys(roadGraph))
        } while (place == address)
        parcels.push({place, address})
    }
    return new villageState("Post Office", parcels)
}
```
The helper function `randomPicker` helps us pick a random element from an array. It does this by generating a random number from 0 up until our **array's length - 1** and uses this random number as index to access an element in the array. 

Calling the `Math.random` function returns a number between 0 and 1 (exclusive) and multiplying it by our array's length returns a number between 0 and our array's length (exclusive). We want to be able to reference this number as a whole number that does not round to our array's length so we pass it as an argument to the `Math.floor` function. The result is then assigned to the binding `pick` and it progresses to access the element

The static method `random` takes `parcelCount` as argument. `parcelCount` holds a number for how many parcels we would like to create for that instance of our class. By default, it gets assigned the number 5. 

The binding `parcels` in the method, holds an empty array that will be used to store all the parcel objects we create. To add the parcels to the array, we write a `for` loop that iterates for **"whatever number** `parcelCount` **gets assigned"** times and for each iteration, we create the parcel object with a pick-up address (assigned to `place`) and a delivery address (assigned to `address`) and add it to the array using the array method `push`.

The `Object.keys` method takes the `roadGraph` object as argument and returns an array of all property names in the object - this property names represent all 11 places in our village **Meadowfield**. We pass this array as an argument to `randomPicker` and this returns a random place from the village. We then assign this "place" to a local binding `place` and progress to define another binding `address` (that gets assigned another random place) but we do not want it to (by chance) hold the same value as the one assigned to `place`(***our pick-up address and delivery address should not be the same***). So we leave this binding undefined and use a `do`/`while` loop to assign a value (place) to it (using the `randomPicker` function) and reassign this value when it is the same as the one we assigned to `place`. 

After iterating, a new instance of our class is returned with the robot's current location as the "Post Office" and the "parcels" as the collection of parcels we have created. Calling the `VilageState.random` method returns an object like this
```javascript
{
  place: 'Post Office',
  parcels: [
    { place: 'Shop', address: "Bob's House" },
    { place: 'Marketplace', address: "Alice's House" },
    { place: "Bob's House", address: 'Shop' },
    { place: 'Marketplace', address: 'Town Hall' },
    { place: 'Town Hall', address: "Daria's House" }
  ]
}
```
#### Robot function
To understand how the robot function works, we need to take a closer look at the `runRobot` function (that simulates our mail delivery robot)
```javascript
function runRobot(state, robot, memory) {
    for (turn = 0; ; turn++) {
        if (state.parcels.length === 0) {
            console.log(`Done in ${turn} turns`)
            break;
        }

        let action = robot(state, memory)
        state = state.move(action.direction)
        memory = action.memory
        console.log(`Moved to ${action.direction}`)

    }
}
```
This function starts off by defining a continuous loop that only breaks when all the parcels in the "VillageState" object has been delivered i.e when our parcels array is empty. 

So the function's task is pretty simple - find a way to deliver all the parcels and hit the `break` statement

We already know that with our "VillageState" object's `move` method, our robot can move and deliver parcels. So the task at hand is to provide a **direction** for the robot to move to everytime the loop iterates and because we want our robot to be able to plan it's route and execute it (so that it can deliver our parcels faster), we need a **memory** value that remembers it's state for every iteration

The *robot function* then simply returns an *object* with a **direction** for our robot to move to and a **memory** value that will be given back to it the next time it is called. 

The **memory** value is an array of well thought out directions that serve as a route for our robot to move in. For every call to the robot function, This array provides the next direction for our robot to move to and then updates itself for the next call, passing the value of that update to the property `memory`

`state` in the `runRobot` function represents the "VillageState" object and `memory` represents the "route" array. The robot function takes `state` and `memory` as arguments and assigns the *object* it returns to the local binding `action`. 

For each iteration, Our robot moves with the **direction** from the `action` object and reassigns it's updated "VilageState" object to `state` for the next iteration. It also reassigns the **updated memory value** from the `action` object to `memory` so we can pass it as argument again to the robot function. 

We define three different robot functions in this chapter `randomRobot`, `routeRobot` and `goalOrientedRobot`. 

The `randomRobot` takes the dumbest approach possible to deliver our parcels. It simply returns a random direction for the robot to move to for every turn. Because it not a well thought out approach that uses a strategic route, it does not need a memory. So, the robot simply ignores the second argument and omits the `memory` property in it's returned object
```javascript
function randomRobot(state) {
    return {direction: randomPicker(roadGraph[state.place])}
}
```
The `randomRobot` uses our helper function `randomPicker` to pick a random place that is only reachable from the robot's current location and assigns this to the `direction` property of the object returned. For each iteration, we continue moving to a random reachable place and with great likelihood, it will run into all our parcels and eventually deliver all of them. 
```javascript
runRobot(villageState.random(), randomRobot)

//outputs
Moved to Marketplace
Moved to Post Office
Moved to Marketplace
.....
Done in 102 turns
```
This will like you already know take a lot of turns which is why planning a "route" for our robot to follow is more efficient. The `routeRobot`  does this and is a big improvement on the `randomRobot` function

Firstly, we find a route that passes all places in the village (from the robot's starting location - the "Post Office"). The robot could run this route twice at which point it is guaranteed to be done delivering all the parcels. We assign this route to a binding `mailRoute` so we can use it in the `routeRobot` function
```javascript
const mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
]
```
The `routeRobot` function takes the first element of this array as the direction for our robot to move to. It then removes it and keeps the rest of it's route as memory for the function's next call
```javascript
  function routeRobot(state, memory) {
    if (memory.length == 0) {
      memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
  }
```
The function returns an object for each turn but only if it's memory isn't empty. If it is, it gets reassigned `mailRoute` first before proceeding to return our object. 

Our starting memory will be an empty array so it gets reassigned first.
The `direction` property will be the first element of the  memory array and `memory` will be the rest of the array with the first element removed. Because we keep removing elements and returning memory for each call, at a point if we have not delivered all our parcels, the memory will be empty again in which case it gets reassigned `mailRoute` 

Since our route is a 13-step route, the robot will take a maximum of 26 turns to deliver all the parcels but usually less and this of course is a significant upgrade on the `randomRobot` function that takes up to a 100 turns sometimes
```javascript
runRobot(villageState.random(), routeRobot, [])

//outputs
Moved to Alice's House 
Moved to Cabin
Moved to Alice's House
.....
Done in 22 turns
```
But blindly following a fixed route is not exactly intelligent. The robot is not being intentional about going to pick a parcel or delivering it so it moves to places that it does not necessarily have to move to, making it do more work. To get our robot to adjust it's behaviour to the actual work to be done, we would need to use some kind of route-finding function. The function `findRoute` helps us fashion out the shortest route between a place A and place B. It does this by growing routes sequentially from place A, exploring and adding routes till it gets to a place B in which case it returns the route that got us there.

Let's use an example to understand this better. Say we want the shortest route from "Cabin" to "Town Hall" in the village **Meadowfield**, we first explore all possible places we can move to from "Cabin" and if any of those is not "Town Hall", we store the route and explore all possible places we can move to from them. we do this continuously till we get a route that gets to "Town Hall"

```
/*
first search (from cabin)
["Alice's House"]

second search
["Alice's House", "Bob's House"] ["Alice's House", "Cabin"] - don't explore
["Alice's House", "Post Office"]

third search
 ["Alice's House", "Bob's House", "Alice's House"] - don't explore
 ["Alice's House", "Bob's House, "Town Hall"] 
 - target achieved, return route and break out of search
 */
```
Exploring the same route like in the "second search" where we go over  "Cabin" again will definitely not return the shortest possible route so we do not even bother exploring it and this cuts down the number of routes the route-finder has to consider. Now let's look at the code implementation
```javascript
  function findRoute(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
       let {at, route} = work[i];
       for (let place of graph[at]) {
          if (place == to) return route.concat(place);
          if (!work.some(w => w.at == place)) {
            work.push({at: place, route: route.concat(place)});
          }
       }
    }
  }
```
* `graph` - represents the graph `roadGraph`
* `from` - represents place A
* `to` - represents place B
* `work` - holds the collection of objects that we have to sequentially explore  (starts with just one)
* `at` - holds the value of the current place we have to explore
* `route` - holds an array of places we have explored to get us to `at` along with `at` itself (`route` is always an empty array at first)

We write a `for` loop that iterates the length of the work array (*note- length is 1 at first but if we don't find place B, we add more objects to be explored before the next iteration*) and for each iteration, we destructure  the object at our current index to get access to its `at` and `route` value and then write another `for` loop to iterate through all the possible places we can get to from it's `at` value (we assign this to a binding `place`  for every iteration).

For each iteration of this second loop, we check if `place` is the same as `to` (place B) and if it is, we return a new array that combines `route`  and `to`(place B) using the array method `concat` and subsequently, break out of the loop. Else we check if we have not explored  `place` before using the `some` method.

If we have, it progresses to the next iteration. If we have not, it adds a new object to `work` so it can be explored. This object's `at` property will be `place` and the `route` property will be a new array combining `route` and  `place`. 

So for example, if we have 3 possible places we can get to from `at` and we have not explored them before, our second loop will add 3 new objects to `work` and then progress to explore them. Our code does not handle a situation where there is no more work items on the work list because we know that our graph is *connected* meaning that every location can be reached from all other locations and our search can't fail.

The `goalOrientedRobot` function represents an upgrade on the `routeRobot` function and implements our route-finding function to move towards parcels or deliver them
```javascript
function goalOrientedRobot({place, parcels}, route) {
   if(route.length == 0) {
     let parcel = parcels[0]
     if (parcel.place !== place) {
     route = findRoute(roadGraph, place, parcel.place)
     }
     else {
     route = findRoute(roadGraph, place, parcel.address)
     }
   }
   return {direction: route[0], memory: route.slice(1)}
}
```

The "VillageState" object in this function is destructured so we can access it's `place` and `parcels` property and It's memory list is renamed `route`.

Just like  the `routeRobot` function, the `goalOrientedRobot` returns an object but only if it's memory list is not empty. If it is, the robot takes the first undelivered parcel in the set and assesses if the pick-up address on that parcel (`parcel.place`) is the same as the robot's current location (`place`). If it is, then it means it has to deliver this parcel so it finds a route from the robot's location to the delivery address(`parcel.address`). If it is not, it means it has to pick-up this parcel so it finds a route from the robot's current location to the pick-up address (`parcel.place`).

For whichever it chooses, pick-up or delivery, it assigns the result of calling the route-finding function to `route` and then progresses to return our object. when it is empty again, our robot makes a decision

This robot finishes the task of delivering all our parcels in about 16 turns which is slightly better than `routeRobot`
```javascript
runRobot(villageState.random(), goalOrientedRobot, [])

//outputs
Moved to Marketplace
Moved to Shop
Moved to Town Hall
.....
Done in 12 turns
```
## Exercises
* [Measuring a Robot](https://github.com/EmmanuelOkorieC/eloquent_Js_third_edition_-7_robot-project/blob/main/measuringRobot.js)

For this exercise, i was tasked to write a function `compareRobots` that takes two robots (and their starting memory) and calculates the **average** number of steps it takes both robot to complete 100 similar tasks

Since we are going to be dealing with steps, I started by modifying the `runRobot` function to simply return the number of turns (steps) it takes to deliver all our parcels
```javascript
function runRobot2 (state, robot, memory) {
    for (let turn = 0; ;turn++) {
        if (state.parcels.length == 0) return turn

        let action = robot(state, memory)
        state = state.move(action.direction)
        memory = action.memory
    }
}
```
Then i progressed to  write the `compareRobots` function

```javascript
function compareRobots(robot1, memory1, robot2, memory2) {
    let turn1 = 0
    let turn2 = 0

    for (let i = 0; i < 100; i++) {
        let state = villageState.random()
        turn1 += runRobot2(state, robot1, memory1)
        turn2 += runRobot2(state, robot2, memory2)
    }
    
    return `robot 1: ${turn1/100} steps, robot 2: ${turn2/100} steps`
}
```
The `for` loop iterates a hundred times and for each iteration, the modified `runRobot` function gets called twice (for both robots) taking the same "VillageState" object (to deliver all it's parcels as it's task). The result of the first call gets added and reassigned to `turn1`, the second to `turn2`. After iterating, `turn1` and `turn2` will hold the total number of turns for 100 tasks completed by both robots. This is then used to calculate the average.
* [Robot Efficiency](https://github.com/EmmanuelOkorieC/eloquent_Js_third_edition_-7_robot-project/blob/main/robotEfficiency.js)

The `goalOrientedRobot` function  is not the most optimal. For this exercise, i was tasked to point out the stupid things it does and write another robot function that improves them and finishes faster

For me, prioritizing one parcel at a time is a stupid thing it does because it does not assess it's route. It just blindly follows the route of the next parcel which means it'd take more turns to deliver our parcels. But by considering all routes, it will fashion out the parcel that is nearer for either pickup or delivery and move towards them. This should make our robot faster. My robot function `emmasRobot` is an implementation of this improvement
```javascript
function emmasRobot({place, parcels}, memory) {
    if(memory.length == 0) {
        let allParcels = parcels.map(parcel => {
           if (parcel.place !== place) {
             return {memory: findRoute(roadGraph, place, parcel.place)}
           } else {
             return {memory: findRoute(roadGraph, place, parcel.address)}
           }
        })
        
        let shortest = allParcels.reduce(
        (a, b) => a.memory.length < b.memory.length ? a : b)
        
        
        memory = shortest.memory
    }
 
   return {direction: memory[0], memory: memory.slice(1)}
}
```

`allParcels` holds the result of mapping through the parcels. This result returns an array of objects with a memory property holding an array of routes. The `reduce` method compares each route's length and returns the object with the shortest route. This object gets assigned to the binding `shortest` and it's memory property is what `memory` gets reassigned to.

For every time the memory list is empty, the Robot goes through the process again. This improvement saw my robot finish in an average of **13 turns** which betters the `goalOrientedRobot`'s 16

* [Persistent Data](https://github.com/EmmanuelOkorieC/eloquent_Js_third_edition_-7_robot-project/blob/main/persistentGroup.js)

Data structures that do not change are called *immutable* or *persistent*. They behave a lot like strings and numbers in that they are who they say they are and stay that way. 

For this exercise, i was tasked to write a class `pGroup` similar to the `Group` class from the last chapter, which stores a set of values. It will  have `add`, `delete` and `has` methods but unlike `Group`, `pGroup` will be persistent. It will return a new `pGroup` instance when the `add` or `delete` method is called. 

It's constructor should not be a part of the class's interface (though we'll use it internally) instead we will use an empty instance `pGroup.empty` as a starting value. I was also asked to explain why we need only one PGroup.empty value, rather than have a function that creates a new, empty map every time

```javascript
class pGroup {
    constructor(members) {
        this.members = members
    }

    add(value) {
        if (this.members.includes(value)) return this
        else return new pGroup(this.members.concat(value))
    }

    delete(value) {
        if (!this.members.includes(value)) return this
        else return new pGroup(this.members.filter(n => n !== value))
    }

    has(value) {
        return this.members.includes(value)
    }

    static empty() {
        return new pGroup([])
    }
}
```

The static method `empty` when called creates an empty instance of the `pGroup` class that will be used as a starting value. Calling the `add` method on it creates a new instance with the given value added and **leaves the pGroup.empty instance unchanged** which is why we do not need a function that creates a new, empty map everytime.
```javascript
let group = pGroup.empty()
let a = group.add(4)

console.log(a) // outputs { members: [ 4 ] }
console.log(group) // outputs { members: [ ] }
```
If the value passed to the `add` method already exists as part of the members of that class instance, it simply returns the class instance. Else it returns a new instance of the class passing an entirely new array (created by combining the current members array and the value argument using the array method `concat`). For the `delete` method, it creates a new instance without a given value when it exists as part of the members of that class. when it doesn't, it returns that class instance
```javascript
let group = pGroup.empty()
let a = group.add(4)
let b = a.add(5)
let c = b.add(5)
let d = c.delete(4)


console.log(a)  //outputs { members: [ 4 ] }
console.log(b)  // outputs { members: [ 4, 5 ] }
console.log(c)  // outputs{ members: [ 4, 5 ] }
console.log(d)  // outputs { members: [ 5 ] }
