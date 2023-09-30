module TSOS {

    export class MemoryManager {
        constructor() {

        }

        public loadMem(program: number[]) {
            let pcb = new ProcessControlBlock();
            this.allocateMem(pcb, program);

            Devices.hostUpdatePcbDisplay();
        }

        public allocateMem(pcb: TSOS.ProcessControlBlock, program: number[]) {
            for (let i = 0x00; i < 0xFF; i++) {
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
}