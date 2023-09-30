module TSOS {
    export class MemoryAccessor {
        constructor() {

        }

        public readMem(pcb: TSOS.ProcessControlBlock, addr: number) {
            return _Memory.getAddr(pcb.baseReg + addr);
        }

        public writeMem(pcb: TSOS.ProcessControlBlock, addr: number, value: number) {
            _Memory.setAddr(pcb.baseReg + addr, value);
        }
    }
}