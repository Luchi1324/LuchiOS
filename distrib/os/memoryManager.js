var TSOS;
(function (TSOS) {
    class MemoryManager {
        residentTasks;
        segMap;
        currSeg;
        constructor() {
            this.residentTasks = [];
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
                // PCB is 'new' when it is created ...
                pcb.createPCB();
                // ... but when we add it to the resident tasks list and after it is loaded ...
                this.residentTasks.push(pcb);
                this.allocateMem(pcb, program);
                // ... then the PCB is now a 'resident'
                pcb.state = "Resident";
                TSOS.Devices.hostUpdatePcbDisplay(pcb);
                return true;
            }
            else {
                return false;
            }
        }
        canBeAllocated(program) {
            // First we check the beginning of each segment ...
            for (let i = 0x000; i <= 0x300; i += 0x100) {
                // ... if it is free and the program fits, it can be allocated ...
                if (this.segMap[i] === false && program.length <= 0xFF) {
                    // Update the current segment that is being allocated
                    this.currSeg = i;
                    return true;
                    // ... or else they are all allocated then we can't allocate more ...
                }
                else if (this.segMap[i] === 'allAllocated') {
                    return false;
                }
                // ... else it doesn't fit and can't be allocated
                //} else {
                //    return false;
                //}
            }
        }
        allocateMem(pcb, program) {
            // Mark segment as allocated, then set our PCB registers accordingly
            this.segMap[this.currSeg] = true;
            pcb.baseReg = this.currSeg;
            pcb.limitReg = pcb.baseReg + 0xFF;
            // Once we set our PCB registers, then we actually write the program to memory
            for (let i = 0; i < program.length; i++) {
                _MemoryAccessor.writeMem(pcb, i, program[i]);
            }
        }
        // Clears a segment of memory associated with a PCB
        clearMemSeg(pcb) {
            for (let i = 0x00; i < 0xFF; i++) {
                _MemoryAccessor.writeMem(pcb, i, 0x00);
            }
            // Marks segment as unallocated, and clears position in resident task list
            this.segMap[pcb.baseReg] = false;
            TSOS.Devices.hostUpdateMemDisplay();
        }
        // Clears all of the memory, and their associated PCBs by clearing each segment
        clearMem() {
            for (let i in this.residentTasks) {
                this.clearMemSeg(this.residentTasks[i]);
            }
            TSOS.Devices.hostUpdateMemDisplay();
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map