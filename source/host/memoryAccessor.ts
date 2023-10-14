module TSOS {
    export class MemoryAccessor {
        constructor() {

        }

        // Reads memory from a location based on it's relative PCB base register
        // If the address being accessed exceeds the limit register of the PCB, we return -1 which is treated as a memory access error
        public readMem(pcb: TSOS.ProcessControlBlock, addr: number): number {
            if (!(pcb.baseReg + addr > pcb.limitReg)) {
                return _Memory.getAddr(pcb.baseReg + addr);
            } else {
                return -1;
            }
        }

        // Writes memory to a location based on it's relative PCB base register
        public writeMem(pcb: TSOS.ProcessControlBlock, addr: number, value: number): void {
            if (!(pcb.baseReg + addr > pcb.limitReg)) {
                _Memory.setAddr(pcb.baseReg + addr, value);
            } else {
                _Kernel.krnTrace("Memory access error");
            }
        }

        // Clears memory by reinitializing it
        public clearMem(): void {
            _Memory.init();
            Devices.hostUpdateMemDisplay();
        }
    }
}