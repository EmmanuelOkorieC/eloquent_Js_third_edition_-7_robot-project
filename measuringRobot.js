function runRobot2 (state, robot, memory) {
    for (let turn = 0; ;turn++) {
        if (state.parcels.length == 0) return turn

        let action = robot(state, memory)
        state = state.move(action.direction)
        memory = action.memory
    }
}

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