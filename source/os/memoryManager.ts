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
            };
        }

        public loadMem(program: number[], pcbSwap?: ProcessControlBlock, priority?: number): boolean {
            if (!pcbSwap) {
                // Creates new PCB object ...
                let pcb = new ProcessControlBlock();
                // ... and if the memory can be allocated
                if (this.canBeAllocated(program) === true) {
                    // PCB is 'new' when it is created ...
                    pcb.createPCB();
                    // ... but when we add it to the resident tasks list, and after it is loaded ...
                    this.residentTasks[pcb.pid] = pcb;
                    this.allocateMem(pcb, program)
                    // ... then the PCB is now a 'resident' and stored in memory
                    pcb.state = "Resident";
                    pcb.location = "Memory";
                    // If we are given a priority, then we assign it so it is not the default 32
                    //if (priority) { 
                    //    pcb.priority = priority 
                    //    };
                    Devices.hostUpdatePcbDisplay(pcb);
                    return true;
                } else {
                    if (_Disk.isFormatted) {
                        pcb.createPCB();
                        this.residentTasks[pcb.pid] = pcb;
                        pcb.state = "Resident";
                        pcb.location = "Disk";
                        //if (priority) { 
                        //    pcb.priority = priority 
                        //};
                        Devices.hostUpdatePcbDisplay(pcb)
                    }
                    return false;
                }
            } else {
                // If we're loading into memory an already existing PCB (called from rollOut)...
                if (this.canBeAllocated(program) === true) {
                    // ... then we only need to allocate the program (rollOut alreay frees up a memory segment)
                    this.allocateMem(pcbSwap, program);
                    pcbSwap.location = "Memory";
                    Devices.hostUpdatePcbDisplay(pcbSwap);
                } else {
                    alert("Load from swap failed");
                }
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
                // ... or we haven't reached the end yet ...
                } else if (i !== 0x300) {
                    continue;
                // ... or else they are all allocated then we can't allocate anymore.
                } else {
                    return false;
                }
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
        public clearMemSeg(pcb: TSOS.ProcessControlBlock, swap: boolean): void {
            for (let i = 0x00; i < 0xFF; i++) {
                _MemoryAccessor.writeMem(pcb, i, 0x00);
            }

            // Marks segment as unallocated, and sets the currSeg pointer to the cleared segment
            this.segMap[pcb.baseReg] = false;

            // ... and removes from resident list (if not called from the swapper)
            if (swap === false) {
                pcb.terminatePCB();
                Devices.hostUpdatePcbDisplay(pcb);
            }

            Devices.hostUpdateMemDisplay();
        }

        // Clears all of the memory, and their associated PCBs by clearing each segment
        public clearMem(): void {
            for (let i in this.residentTasks) {
                this.clearMemSeg(this.residentTasks[i], false);
            }
            Devices.hostUpdateMemDisplay();
        }
    }
}