module TSOS {

    export class ProcessControlBlock {
        static currentPID: number = -1;

        constructor(
            public pid: number = 0,
            public pc: number = 0,
            public instructionReg: number = 0x00,
            public baseReg: number = 0x00,
            public limitReg: number = 0x00,
            public acc: number = 0,
            public XReg: number = 0,
            public YReg: number = 0,
            public ZFlag: number = 0,
            public state: string = "" // New, Ready, Resident, Executing, Terminated
            ){
        }

        public createPCB() {
            // Creates new PCB, class keeps track of current PID number
            this.pid = ProcessControlBlock.currentPID++;
            this.pc = 0;
            this.instructionReg = 0x00;
            this.baseReg = 0x00;
            this.limitReg = 0x00;
            this.acc = 0;
            this.XReg = 0;
            this.YReg = 0;
            this.ZFlag = 0;
            this.state = "New";
            // Refreshes PCB display upon new PCB creation
            Devices.hostUpdatePcbDisplay(this);
        }

        public updatePCB(pc: number, acc: number, XReg: number, YReg: number, ZFlag: number, state: string) {
            this.pc = pc;
            this.acc = acc;
            this.XReg = XReg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
            this.state = state;
        }

    }
}