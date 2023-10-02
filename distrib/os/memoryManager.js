var TSOS;
(function (TSOS) {
    class MemoryManager {
        pcbArr;
        constructor() {
            this.pcbArr = [];
        }
        loadMem(program) {
            let pcb = new TSOS.ProcessControlBlock();
            pcb.createPCB();
            this.pcbArr.push(pcb);
            this.allocateMem(pcb, program);
        }
        allocateMem(pcb, program) {
            for (let i = 0x00; i <= 0xFF; i++) {
                // First we find the first empty memory space ...
                if (_Memory.memArray[i] === 0x00) {
                    // ... then we set the pcb's base register to this location, and set the limitReg to fit the full 0xFF bytes
                    pcb.baseReg = i;
                    pcb.limitReg = pcb.baseReg + 0xFF;
                    break;
                }
            }
            // Now we actually write the program to memory
            for (let i = 0x00; i < program.length; i++) {
                _MemoryAccessor.writeMem(pcb, i, program[i]);
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map