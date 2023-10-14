var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() {
        }
        // Reads memory from a location based on it's relative PCB base register
        // If the address being accessed exceeds the limit register of the PCB, we return -1 which is treated as a memory access error
        readMem(pcb, addr) {
            if (!(pcb.baseReg + addr > pcb.limitReg)) {
                return _Memory.getAddr(pcb.baseReg + addr);
            }
            else {
                return -1;
            }
        }
        // Writes memory to a location based on it's relative PCB base register
        writeMem(pcb, addr, value) {
            if (!(pcb.baseReg + addr > pcb.limitReg)) {
                _Memory.setAddr(pcb.baseReg + addr, value);
            }
            else {
                _Kernel.krnTrace("Memory access error");
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