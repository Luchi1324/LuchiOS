var TSOS;
(function (TSOS) {
    class MemoryManager {
        pcbArr;
        segMap;
        currSeg;
        constructor() {
            this.pcbArr = [];
            this.currSeg = 0;
            this.segMap = {
                0x000: false,
                0x100: false,
                0x200: false,
                0x300: 'allAllocated'
            };
        }
        loadMem(program) {
            // Creates new PCB object ...
            let pcb = new TSOS.ProcessControlBlock();
            // ... and if the memory can be allocated
            if (this.canBeAllocated(program) === true) {
                pcb.createPCB();
                this.pcbArr.push(pcb);
                this.allocateMem(pcb, program);
                return true;
            }
            else {
                return false;
            }
        }
        canBeAllocated(program) {
            for (let i = 0x000; i <= 0x300; i += 0x100) {
                if (this.segMap[i] === false && program.length <= 0xFF) {
                    this.currSeg = i;
                    return true;
                }
                else if (this.segMap[i] === 'allAllocated') {
                    return false;
                }
            }
        }
        allocateMem(pcb, program) {
            this.segMap[this.currSeg] = true;
            pcb.baseReg = this.currSeg;
            pcb.limitReg = pcb.baseReg + 0xFF;
            // Now we actually write the program to memory
            for (let i = 0; i < program.length; i++) {
                _MemoryAccessor.writeMem(pcb, i, program[i]);
            }
        }
        // Clears a segment of memory associated with a PCB
        clearMemSeg(pcb) {
            for (let i = pcb.baseReg; i < pcb.limitReg; i++) {
                _MemoryAccessor.writeMem(pcb, i, 0x00);
            }
            // Marks segment as unallocated
            this.segMap[pcb.baseReg] = false;
            TSOS.Devices.hostUpdateMemDisplay();
        }
        // Clears all of the memory, and their associated PCBs by clearing each segment
        clearMem() {
            for (let i in this.pcbArr) {
                this.clearMemSeg(this.pcbArr[i]);
            }
            TSOS.Devices.hostUpdateMemDisplay();
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map