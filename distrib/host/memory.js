var TSOS;
(function (TSOS) {
    class Memory {
        memArray;
        constructor(memArray = new Array(0x300)) {
            this.memArray = memArray;
        }
        // Fills the main memory with empty values upon initialization
        init() {
            this.memArray.fill(0x00);
        }
        // Below commands are used by memoryAccessor to work with 
        // Gets the value of a given address
        getAddr(addr) {
            return this.memArray[addr];
        }
        // Sets the value of a given address
        setAddr(addr, value) {
            if (value <= 0xFF) {
                this.memArray[addr] = value;
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map