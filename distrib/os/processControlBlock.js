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
            // General update function, if null is passed then we keep the current values in the CPU registers
            this.pc = pc;
            this.acc = acc;
            this.XReg = XReg;
            this.XReg = YReg;
            this.ZFlag = ZFlag;
            this.state = state;
            // Refreshes PCB display upon PCB update
            //Devices.hostUpdatePcbDisplay(this);
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map