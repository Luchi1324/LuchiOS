var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() {
        }
        // Reads memory from a location based on it's relative PCB base register
        // If the address being accessed exceeds the limit register of the PCB, we return 0x00
        readMem(pcb, addr) {
            if (pcb.baseReg + addr < pcb.limitReg) {
                //alert(_Memory.getAddr(pcb.baseReg + addr));
                return _Memory.getAddr(pcb.baseReg + addr);
            }
            else {
                _Kernel.krnTrace(`[R]Memory access error from process ${pcb.pid}`);
                return 0x00;
            }
        }
        // Writes memory to a location based on it's relative PCB base register
        writeMem(pcb, addr, value) {
            if (pcb.baseReg + addr < pcb.limitReg) {
                if (value <= 0xFF) {
                    _Memory.setAddr(pcb.baseReg + addr, value);
                }
            }
            else {
                _Kernel.krnTrace(`[W]Memory access error from process ${pcb.pid}`);
                pcb.terminatePCB();
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map