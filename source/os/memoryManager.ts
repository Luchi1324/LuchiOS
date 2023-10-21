module TSOS {

    export class MemoryManager {
        public pcbArr: ProcessControlBlock[];
        public segMap: Object;
        public currSeg: number;

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

        public loadMem(program: number[]): boolean {
            // Creates new PCB object ...
            let pcb = new ProcessControlBlock();
            // ... and if the memory can be allocated
            if (this.canBeAllocated(program) === true) {
                pcb.createPCB();
                this.pcbArr.push(pcb);
                this.allocateMem(pcb, program)
                return true;
            } else {
                return false;
            }

        }

        public canBeAllocated(program: number[]): boolean {
            for (let i = 0x000; i <= 0x300; i += 0x100) {
                if (this.segMap[i] === false && program.length <= 0xFF) {
                    this.currSeg = i;
                    return true;
                } else if (this.segMap[i] === 'allAllocated') {
                    return false;
                }
            }
        }

        public allocateMem(pcb: TSOS.ProcessControlBlock, program: number[]): void{
            this.segMap[this.currSeg] = true; 
            pcb.baseReg = this.currSeg;
            pcb.limitReg = pcb.baseReg + 0xFF;
            // Now we actually write the program to memory
            for (let i = 0; i < program.length; i++) {
                _MemoryAccessor.writeMem(pcb, i, program[i]);
            }
        }

        // Clears a segment of memory associated with a PCB
        public clearMemSeg(pcb: TSOS.ProcessControlBlock): void {
            for (let i = pcb.baseReg; i < pcb.limitReg; i++) {
                _MemoryAccessor.writeMem(pcb, i, 0x00);
            }

            // Marks segment as unallocated
            this.segMap[pcb.baseReg] = false;
            Devices.hostUpdateMemDisplay();
        }

        // Clears all of the memory, and their associated PCBs by clearing each segment
        public clearMem(): void {
            for (let i in this.pcbArr) {
                this.clearMemSeg(this.pcbArr[i]);
            }
            Devices.hostUpdateMemDisplay();
        }
    }
}