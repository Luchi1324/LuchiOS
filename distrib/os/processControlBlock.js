var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        pid;
        pc;
        baseReg;
        limitReg;
        location;
        acc;
        XReg;
        YReg;
        ZFlag;
        state;
        waitCycles;
        turnCycles;
        static currentPID = -1;
        constructor(pid = 0, pc = 0, baseReg = 0x00, limitReg = 0x00, location = "", acc = 0, XReg = 0, YReg = 0, ZFlag = 0, state = "", waitCycles = 0, turnCycles = 0) {
            this.pid = pid;
            this.pc = pc;
            this.baseReg = baseReg;
            this.limitReg = limitReg;
            this.location = location;
            this.acc = acc;
            this.XReg = XReg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
            this.state = state;
            this.waitCycles = waitCycles;
            this.turnCycles = turnCycles;
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
            // General update function
            this.pc = pc;
            this.acc = acc;
            this.XReg = XReg;
            this.YReg = YReg;
            this.ZFlag = ZFlag;
            this.state = state;
            // Refreshes PCB display upon PCB update
            TSOS.Devices.hostUpdatePcbDisplay(this);
        }
        terminatePCB() {
            _Kernel.krnKillTask(this.pid);
            // Prints wait and turnaround time for the process
            _StdOut.advanceLine();
            _StdOut.putText(`Process PID: ${this.pid}`);
            _StdOut.advanceLine();
            _StdOut.putText(`Wait time: ${this.waitCycles}`);
            _StdOut.advanceLine();
            _StdOut.putText(`Turnaround time: ${this.turnCycles}`);
            _StdOut.advanceLine();
            // Refreshes PCB display upon PCB termination
            TSOS.Devices.hostUpdatePcbDisplay(this);
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map