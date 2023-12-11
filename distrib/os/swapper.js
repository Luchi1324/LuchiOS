var TSOS;
(function (TSOS) {
    class Swapper {
        constructor() {
        }
        rollIn(pcb) {
            if (pcb) {
                let rollInData = _krnDiskDriver.readFile('.swap' + pcb.pid);
                //alert('Roll In: ' + rollInData + `length: ${rollInData.length}`);
                let dataArr = rollInData.match(/.{1,2}/g);
                //alert('Data: ' + dataArr + `length: ${dataArr.length}`);
                // Memory works in number, but disk works in string so we need to convert between the two
                let program = dataArr.map(byte => parseInt(byte, 16));
                //alert('Program: ' + program);
                // Load our existing PCB into memory
                _MemoryManager.loadMem(program, pcb);
                TSOS.Devices.hostUpdateDiskDisplay();
            }
        }
        rollOut(pcb) {
            let rollOutData = "";
            for (let i = 0; i < 0xFF; i++) {
                // .toString(16) on anything less than 0x10 returns a single digit instead of two (i.e. 0x0B is just 'B')
                // We need to pad these with an extra 0, or it breaks the program as rollIn reads in batches of 2 characters
                let byte = _MemoryAccessor.readMem(pcb, i).toString(16).padStart(2, '0');
                rollOutData += byte;
            }
            // Clear the associated memory segment, and then create the swap file
            _MemoryManager.clearMemSeg(pcb, true);
            _krnDiskDriver.createSwapFile(pcb.pid, rollOutData);
            // Once it's been created, we update the PCB's location and then update the displays accordingly
            pcb.location = "Disk";
            TSOS.Devices.hostUpdatePcbDisplay(pcb);
            TSOS.Devices.hostUpdateDiskDisplay();
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map