var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        pid;
        pc;
        instructionReg;
        baseReg;
        limitReg;
        acc;
        XReg;
        YReg;
        ZFlag;
        state;
        static currentPID = -1;
        constructor(pid = 0, pc = 0, instructionReg = 0x00, baseReg = 0x00, limitReg = 0x00, acc = 0, XReg = 0, YReg = 0, ZFlag = 0, state = "" // New, Ready, Resident, Executing, Terminated
        ) {
            this.pid = pid;
            this.pc = pc;
            this.instructionReg = instructionReg;
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
            this.instructionReg = 0x00;
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
            this.pc = pc;
            this.acc = acc;
            this.XReg = XReg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
            this.state = state;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map