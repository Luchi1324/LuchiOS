module TSOS {
    export class MemoryAccessor {
        constructor() {

        }

        // Reads memory from a location based on it's relative PCB base register
        // Not particaruly useful now, but just future proofing when we need to load more than one program. 
        // It should make loops easier (i.e. just using one loop that starts at 0x00 for everything instead of setting a new loop based on the PCB's base register)
        public readMem(pcb: TSOS.ProcessControlBlock, addr: number): number {
            return _Memory.getAddr(pcb.baseReg + addr);
        }

        // Writes memory to a location based on it's relative PCB base register
        public writeMem(pcb: TSOS.ProcessControlBlock, addr: number, value: number): void {
            _Memory.setAddr(pcb.baseReg + addr, value);
        }
    }
}