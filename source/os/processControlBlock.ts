module TSOS {

    export class ProcessControlBlock {
        static currentPID: number = 0;

        constructor(
            public pid: number = 0,
            public pc: number = 0,
            public ir: number = 0,
            public acc: number = 0,
            public XReg: number = 0,
            public YReg: number = 0,
            public ZFlag: number = 0,
            public state: string = "" // New, Ready, Resident, Executing, Terminated
            ){
        }

        public init() {
            this.pid = 0;
            this.pc = 0;
            this.ir = 0x00;
            this.acc = 0;
            this.XReg = 0;
            this.YReg = 0;
            this.ZFlag = 0;
            this.state = "";
        }

        public createPCB() {
            this.pid = ProcessControlBlock.currentPID++;
            this.pc = 0;
            this.ir = 0x00;
            this.acc = 0;
            this.XReg = 0;
            this.YReg = 0;
            this.ZFlag = 0;
            this.state = "New";
        }

        public updatePCB(pc: number, acc: number, XReg: number, YReg: number, ZFlag: number) {
            this.pc = pc;
            this.acc = acc;
            this.XReg = XReg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
        }

    }
}