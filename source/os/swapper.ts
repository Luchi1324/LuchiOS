module TSOS {
    export class Swapper {
        constructor() { 
        }

        public rollIn(pcb: ProcessControlBlock): void {

        } 

        public rollOut(pcb: ProcessControlBlock): void {
            let rollOutData: string = "";
            for (let i = 0; i < ((pcb.limitReg - pcb.baseReg) * 2); i += 2) {
                rollOutData += (_MemoryAccessor.readMem(pcb, i)).toString(16) + " ";
            }

            rollOutData.trim()
            _MemoryManager.clearMemSeg(pcb);
            
            _krnDiskDriver.createSwapFile(pcb, rollOutData)
            Devices.hostUpdateDiskDisplay();
        }
    }
}