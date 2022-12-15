//"use strict"
const roads = [
    "Alice's House-Bob's House", "Alice's House-Cabin",
    "Alice's House-Post Office", "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop", "Marketplace-Farm",
    "Marketplace-Post Office", "Marketplace-Shop",
    "Marketplace-Town Hall", "Shop-Town Hall"
    ];

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
// console.log(roadGraph)

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

let first = new villageState('Post Office', [{place: "Bob's House", address: "Alice's House"}, {place: "Town Hall", address: "Post Office"}])
let next = first.move(`Alice's House`)

// console.log(next.parcels)
// console.log(next.place)

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

function randomPicker(array) {
    let pick = Math.floor(Math.random() * array.length)
    return array[pick]
}

function randomRobot(state) {
    return {direction: randomPicker(roadGraph[state.place])}
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

// runRobot(villageState.random(), randomRobot)
// console.log(villageState.random())

const mailRoute = ["Alice's House", "Cabin", "Alice's House", "Bob's House", "Town Hall",
"Daria's House", "Ernie's House", "Grete's House", "Farm", "Marketplace", "Shop", "Marketplace", "Post Office"    
]

function routeRobot (state, memory) {
    if (memory.length == 0) {
        memory = mailRoute
    }
    return {direction: memory[0], memory: memory.slice(1)}
}

// runRobot(villageState.random(), routeRobot, [])

function findRoute(graph, from, to) {
    let work =[{at: from, route: []}]
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i]
        for (let place of graph[at]) {
            if (place == to) return route.concat(place)
            if (!work.some(w => w.at === place)) {
              work.push({at: place, route: route.concat(place)})
            }
        }
    }
}


// console.log(findRoute(roadGraph, "Cabin", "Town Hall"))

function goalOrientedRobot({place, parcels}, memory) {
   if(memory.length === 0) {
   let parcel = parcels[0]
   if (parcel.place !== place) {
     memory = findRoute(roadGraph, place, parcel.place)
   }
   else {
    memory = findRoute(roadGraph, place, parcel.address)
   }
}
return {direction: memory[0], memory: memory.slice(1)}
}

// runRobot(villageState.random(), goalOrientedRobot, [])


