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