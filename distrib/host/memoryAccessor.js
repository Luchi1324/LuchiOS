var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() {
        }
        // Reads memory from a location based on it's relative PCB base register
        // If the address being accessed exceeds the limit register of the PCB, we return -1 which is treated as a memory access error
        readMem(pcb, addr) {
            if (pcb.baseReg + addr < pcb.limitReg) {
                return _Memory.getAddr(pcb.baseReg + addr);
            }
            else {
                _Kernel.krnTrace(`Memory access error from process ${pcb.pid}`);
                return;
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
                _Kernel.krnTrace(`Memory access error from process ${pcb.pid}`);
                _StdOut.putText(`Memory access error from process ${pcb.pid}`);
            }
        }
        // Clears memory by reinitializing it
        clearMem() {
            _Memory.init();
            TSOS.Devices.hostUpdateMemDisplay();
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map