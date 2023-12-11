module TSOS {
    export class Swapper {
        constructor() { 
        }

        public rollIn(pcb: ProcessControlBlock): void {
            if (pcb) {
                let rollInData = _krnDiskDriver.readFile('.swap' + pcb.pid);
                alert('Roll In: ' + rollInData)
                let dataArr = rollInData.match(/.{1,2}/g);
                alert('Data: ' + dataArr)

                // Memory works in number, but disk works in string so we need to convert between the two
                let program: number[] = [];
                for (let i = 0; i < dataArr.length; i++) {
                    program.push(parseInt(dataArr[i], 16));
                }
                alert('Program: ' + program);
                // Load our existing PCB into memory
                _MemoryManager.loadMem(program, pcb);
                Devices.hostUpdateDiskDisplay();
            }
        } 

        public rollOut(pcb: ProcessControlBlock): void {
            let rollOutData: string = "";
            for (let i = 0; i < ((pcb.limitReg - pcb.baseReg)); i++) {
                rollOutData += (_MemoryAccessor.readMem(pcb, i)).toString(16) + " ";
            }

            // Trim the rollOutData, clear the associated memory segment, and then create the swap file
            alert('Roll Out: ' + rollOutData);
            _MemoryManager.clearMemSeg(pcb, true);
            _krnDiskDriver.createSwapFile(pcb.pid, rollOutData);

            // Once it's been created, we update the PCB's location and then update the displays accordingly
            pcb.location = "Disk";
            Devices.hostUpdatePcbDisplay(pcb);
            Devices.hostUpdateDiskDisplay();
        }
    }
}
