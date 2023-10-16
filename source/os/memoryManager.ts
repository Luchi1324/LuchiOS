module TSOS {

    export class MemoryManager {
        public pcbArr: ProcessControlBlock[];
        public segMap;

        constructor() {
            this.pcbArr = [];
            this.segMap = {
                0x000: false,
                0x100: false,
                0x200: false
            };
        }

        public loadMem(program: number[]): boolean {
            // Creates new PCB object ...
            let pcb = new ProcessControlBlock();
            // ... and if the memory can be allocated
            if (this.allocateMem(pcb, program) === true) {
                pcb.createPCB();
                this.pcbArr.push(pcb);
                return true;
            } else {
                return false;
            }

        }

        // TODO: Fix allocateMem not handing all segments being allocated already properly
        public allocateMem(pcb: TSOS.ProcessControlBlock, program: number[]): boolean {
            for (let i = 0x00; i < 0x300; i += 0x100) {
                // First we check if the memory segment has been allocated already ...
                if (this.segMap[i] === true) {
                    continue;
                // ... and if is not allocated then we set the PCB's base and limit registers ...
                //} else if (_Memory.memArray[i] === 0x00) {
                } else if (this.segMap[i] === false) {
                    this.segMap[i] = true;
                    pcb.baseReg = i;
                    pcb.limitReg = pcb.baseReg + 0xFF;
                    break;
                // ... otherwise they're all allocated and we exit the function before anything is written.
                } else {
                    alert('All memory allocated');
                    return false;
                }
            }
            
            // Now we actually write the program to memory
            for (let i = 0; i < program.length; i++) {
                _MemoryAccessor.writeMem(pcb, i, program[i]);
            }
            return true;
        }

        // clearMem ^ 2, this is a bandaid solution until I can think of something smarter
        public clearMem(): void {
            _MemoryAccessor.clearMem();
        }
    }
}