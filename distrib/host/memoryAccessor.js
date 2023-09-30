var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() {
        }
        readMem(pcb, addr) {
            return _Memory.getAddr(pcb.baseReg + addr);
        }
        writeMem(pcb, addr, value) {
            _Memory.setAddr(pcb.baseReg + addr, value);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map