module TSOS {

    export class MemoryManager {
        public residentTasks: ProcessControlBlock[];
        public segMap: Object;
        public currSeg: number;

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

        public loadMem(program: number[]): boolean {
            // Creates new PCB object ...
            let pcb = new ProcessControlBlock();
            // ... and if the memory can be allocated
            if (this.canBeAllocated(program) === true) {
                // PCB is 'new' when it is created ...
                pcb.createPCB();
                // ... but when we add it to the resident tasks list, global PCB list and after it is loaded ...
                //_PCBList.push(pcb);
                this.residentTasks.push(pcb);
                this.allocateMem(pcb, program)
                // ... then the PCB is now a 'resident'
                pcb.state = "Resident";
                Devices.hostUpdatePcbDisplay(pcb);
                return true;
            } else {
                return false;
            }

        }

        public canBeAllocated(program: number[]): boolean {
            // First we check the beginning of each segment ...
            for (let i = 0x000; i <= 0x300; i += 0x100) {
                // ... if it is free and the program fits, it can be allocated ...
                if (this.segMap[i] === false && program.length <= 0xFF) {
                    // Update the current segment that is being allocated
                    this.currSeg = i;
                    return true;
                // ... or else they are all allocated then we can't allocate more ...
                } else if (this.segMap[i] === 'allAllocated') {
                    return false;
                }
                // ... else it doesn't fit and can't be allocated
                //} else {
                //    return false;
                //}
            }
        }

        public allocateMem(pcb: TSOS.ProcessControlBlock, program: number[]): void {
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
        public clearMemSeg(pcb: TSOS.ProcessControlBlock): void {
            for (let i = 0x00; i < 0xFF; i++) {
                _MemoryAccessor.writeMem(pcb, i, 0x00);
            }

            // Marks segment as unallocated, and clears position in global PCB list
            this.segMap[pcb.baseReg] = false;
            Devices.hostUpdateMemDisplay();
        }

        // Clears all of the memory, and their associated PCBs by clearing each segment
        public clearMem(): void {
            for (let i in this.residentTasks) {
                this.clearMemSeg(this.residentTasks[i]);
            }
            /*for (let i in _PCBList) {
                this.clearMemSeg(_PCBList[i]);
            }*/
            Devices.hostUpdateMemDisplay();
        }
    }
}