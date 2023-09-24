var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        pid;
        pc;
        ir;
        acc;
        XReg;
        YReg;
        ZFlag;
        state;
        static currentPID = 0;
        constructor(pid = 0, pc = 0, ir = 0, acc = 0, XReg = 0, YReg = 0, ZFlag = 0, state = "" // New, Ready, Resident, Executing, Terminated
        ) {
            this.pid = pid;
            this.pc = pc;
            this.ir = ir;
            this.acc = acc;
            this.XReg = XReg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
            this.state = state;
        }
        init() {
            this.pid = 0;
            this.pc = 0;
            this.ir = 0x00;
            this.acc = 0;
            this.XReg = 0;
            this.YReg = 0;
            this.ZFlag = 0;
            this.state = "";
        }
        createPCB() {
            this.pid = ProcessControlBlock.currentPID++;
            this.pc = 0;
            this.ir = 0x00;
            this.acc = 0;
            this.XReg = 0;
            this.YReg = 0;
            this.ZFlag = 0;
            this.state = "New";
        }
        updatePCB(pc, acc, XReg, YReg, ZFlag) {
            this.pc = pc;
            this.acc = acc;
            this.XReg = XReg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map