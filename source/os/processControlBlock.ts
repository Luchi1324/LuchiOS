module TSOS {

    export class ProcessControlBlock {
        static currentPID: number = -1;

        constructor(
            public pid: number = 0,
            public pc: number = 0,
            public baseReg: number = 0x00,
            public limitReg: number = 0x00,
            public acc: number = 0,
            public XReg: number = 0,
            public YReg: number = 0,
            public ZFlag: number = 0,
            public state: string = ""
            ){
        }

        public createPCB(): void {
            // Creates new PCB, class keeps track of current PID number
            ProcessControlBlock.currentPID++
            this.pid = ProcessControlBlock.currentPID;
            this.pc = 0;
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

        public updatePCB(pc?: number, acc?: number, XReg?: number, YReg?: number, ZFlag?: number, state?: string): void {
            // General update function, ternary operators allow for all parameters to be made optional
            typeof pc !== null ? this.pc = pc : this.pc = this.pc;
            typeof acc !== null ? this.acc = acc : this.acc = this.acc;
            typeof XReg !== null ? this.XReg = XReg : this.XReg = this.XReg;
            typeof YReg !== null ? this.XReg = YReg : this.XReg = this.XReg;
            typeof ZFlag !== null ? this.ZFlag = ZFlag : this.ZFlag = this.ZFlag;
            typeof state !== null ? this.state = state : this.state = this.state;
            // Refreshes PCB display upon PCB update
            Devices.hostUpdatePcbDisplay(this);
        }

    }
}