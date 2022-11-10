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

let group = pGroup.empty()
let a = group.add(4)
let b = a.add(5)
let c = b.add(5)
let d = c.delete(4)