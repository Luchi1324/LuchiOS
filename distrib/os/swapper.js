var TSOS;
(function (TSOS) {
    class Swapper {
        constructor() {
        }
        rollIn(pcb) {
        }
        rollOut(pcb) {
            let rollOutData = "";
            for (let i = 0; i < ((pcb.limitReg - pcb.baseReg) * 2); i += 2) {
                rollOutData += (_MemoryAccessor.readMem(pcb, i)).toString(16) + " ";
            }
            rollOutData.trim();
            _MemoryManager.clearMemSeg(pcb);
            _krnDiskDriver.createSwapFile(pcb, rollOutData);
            TSOS.Devices.hostUpdateDiskDisplay();
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map