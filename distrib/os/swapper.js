var TSOS;
(function (TSOS) {
    class Swapper {
        constructor() {
        }
        rollIn(pcb) {
            if (pcb) {
                let rollInData = _krnDiskDriver.readFile('.swap' + pcb.pid);
                alert(rollInData);
                let dataArr = rollInData.match(/.{1,2}/g);
                alert(dataArr);
                // Memory works in number, but disk works in string so we need to convert between the two
                let program = [];
                for (let i = 0; i < (dataArr.length); i++) {
                    program.push(parseInt(dataArr[i], 16));
                }
                alert(program);
                // Load our existing PCB into memory
                _MemoryManager.loadMem(program, pcb);
                //_krnDiskDriver.deleteFile('.swap' + pcb.pid)
                TSOS.Devices.hostUpdateDiskDisplay();
            }
        }
        rollOut(pcb) {
            let rollOutData = "";
            for (let i = 0; i < ((pcb.limitReg - pcb.baseReg)); i++) {
                rollOutData += (_MemoryAccessor.readMem(pcb, i)).toString(16) + " ";
            }
            // Trim the rollOutData, clear the associated memory segment, and then create the swap file
            rollOutData.trim();
            _MemoryManager.clearMemSeg(pcb, true);
            _krnDiskDriver.createSwapFile(pcb, rollOutData);
            // Once it's been created, we update the PCB's location and then update the displays accordingly
            pcb.location = "Disk";
            TSOS.Devices.hostUpdatePcbDisplay(pcb);
            TSOS.Devices.hostUpdateDiskDisplay();
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map