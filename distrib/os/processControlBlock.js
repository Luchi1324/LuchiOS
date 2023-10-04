var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        pid;
        pc;
        baseReg;
        limitReg;
        acc;
        XReg;
        YReg;
        ZFlag;
        state;
        static currentPID = -1;
        constructor(pid = 0, pc = 0, baseReg = 0x00, limitReg = 0x00, acc = 0, XReg = 0, YReg = 0, ZFlag = 0, state = "") {
            this.pid = pid;
            this.pc = pc;
            this.baseReg = baseReg;
            this.limitReg = limitReg;
            this.acc = acc;
            this.XReg = XReg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
            this.state = state;
        }
        createPCB() {
            // Creates new PCB, class keeps track of current PID number
            ProcessControlBlock.currentPID++;
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
            TSOS.Devices.hostUpdatePcbDisplay(this);
        }
        updatePCB(pc, acc, XReg, YReg, ZFlag, state) {
            // General update function, ternary operators allow for all parameters to be made optional
            typeof pc !== null ? this.pc = pc : this.pc = this.pc;
            typeof acc !== null ? this.acc = acc : this.acc = this.acc;
            typeof XReg !== null ? this.XReg = XReg : this.XReg = this.XReg;
            typeof YReg !== null ? this.XReg = YReg : this.XReg = this.XReg;
            typeof ZFlag !== null ? this.ZFlag = ZFlag : this.ZFlag = this.ZFlag;
            typeof state !== null ? this.state = state : this.state = this.state;
            // Refreshes PCB display upon PCB update
            TSOS.Devices.hostUpdatePcbDisplay(this);
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map