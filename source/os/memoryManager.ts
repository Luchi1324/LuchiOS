module TSOS {

    export class MemoryManager {
        public pcbArr: ProcessControlBlock[];
        constructor() {
            this.pcbArr = [];
        }

        public loadMem(program: number[]): number {
            // Creates new PCB object ...
            let pcb = new ProcessControlBlock();
            pcb.createPCB();
            // ... then we add it to the pcb array and then allocate the memory
            this.pcbArr.push(pcb);
            this.allocateMem(pcb, program);

            // Works with load() function and returns the created PCB's PID
            return pcb.pid;
        }

        public allocateMem(pcb: TSOS.ProcessControlBlock, program: number[]): void {
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

        // clearMem ^ 2, this is a bandaid solution until I can think of something smarter
        public clearMem(): void {
            _MemoryAccessor.clearMem();
        }
    }
}