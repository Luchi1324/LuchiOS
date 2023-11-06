/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Cpu {
        PC;
        instruReg;
        Acc;
        Xreg;
        Yreg;
        Zflag;
        isExecuting;
        currentPCB;
        singleStep;
        stepPulse;
        constructor(PC = 0, instruReg = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false, currentPCB = null, singleStep = false, stepPulse = false) {
            this.PC = PC;
            this.instruReg = instruReg;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.currentPCB = currentPCB;
            this.singleStep = singleStep;
            this.stepPulse = stepPulse;
        }
        init() {
            this.PC = 0;
            this.instruReg = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentPCB = null;
        }
        // Used for loading a program into CPU/context switching
        loadProgram(pcb) {
            //alert("Loading program!");
            if (pcb.state !== "Terminated") {
                this.currentPCB = pcb;
                this.PC = this.currentPCB.pc;
                this.Acc = this.currentPCB.acc;
                this.Xreg = this.currentPCB.XReg;
                this.Yreg = this.currentPCB.YReg;
                this.Zflag = this.currentPCB.ZFlag;
                this.currentPCB.state = "Executing";
                TSOS.Devices.hostUpdatePcbDisplay(this.currentPCB);
                this.isExecuting = true;
            }
        }
        runProgram(pid) {
            // We load our PCB into the CPU and then execute the program
            this.currentPCB = _MemoryManager.residentTasks[pid];
            this.currentPCB.state = "Executing";
            TSOS.Devices.hostUpdatePcbDisplay(this.currentPCB);
            this.isExecuting = true;
        }
        x;
        runAllPrograms() {
            let pcb = null;
            for (let i = 0; i < _MemoryManager.residentTasks.length; i++) {
                if (_MemoryManager.residentTasks[i].state === "Resident") {
                    pcb = _MemoryManager.residentTasks[i];
                    pcb.state = "Ready";
                    TSOS.Devices.hostUpdatePcbDisplay(pcb);
                    _Scheduler.readyQueue.enqueue(pcb);
                }
            }
            //this.isExecuting = true;
            _Scheduler.scheduleRR();
        }
        cycle() {
            if (this.isExecuting && this.currentPCB !== null) {
                _Kernel.krnTrace('CPU cycle');
                // 'Fetches' instruction
                let instruction = _MemoryAccessor.readMem(this.currentPCB, this.PC);
                this.instruReg = instruction;
                TSOS.Devices.hostUpdateMemDisplay(true, this.PC);
                // 'Decodes' the function in the switch statement, then 'executes' it accordingly
                switch (instruction) {
                    case 0xA9:
                        this.loadAccConst();
                        break;
                    case 0xAD:
                        this.loadAccMem();
                        break;
                    case 0x8D:
                        this.storeAccMem();
                        break;
                    case 0x6D:
                        this.addWithCarry();
                        break;
                    case 0xA2:
                        this.loadXConst();
                        break;
                    case 0xAE:
                        this.loadXMem();
                        break;
                    case 0xA0:
                        this.loadYConst();
                        break;
                    case 0xAC:
                        this.loadYMem();
                        break;
                    case 0xEA:
                        this.PC++;
                        break;
                    case 0xEC:
                        this.compByteToX();
                        break;
                    case 0xD0:
                        this.branchNifZisZero();
                        break;
                    case 0xEE:
                        this.incrementByte();
                        break;
                    case 0x00:
                        this.breakOp();
                        _StdOut.advanceLine();
                        //_OsShell.putPrompt();
                        break;
                    case 0xFF:
                        this.sysCall();
                        break;
                    default:
                        this.isExecuting = false;
                        _StdOut.putText(`PID ${this.currentPCB.pid}: Invalid instruction - ${instruction}. Terminating current process...`);
                        _StdOut.advanceLine();
                        this.currentPCB.terminatePCB();
                        this.currentPCB = null;
                        _OsShell.putPrompt();
                        break;
                }
            }
            // Update PCB after complete cycle
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
            // Check if we have exceeded our quantum for RR
            _Scheduler.quantaCheck();
            TSOS.Devices.hostUpdateCpuDisplay();
        }
        // 6502 Op Code functions
        // All of the functions follow a similar procedure
        // Everytime the CPU reads a memory address or does something, the program counter goes up by one 
        // At the end of every function, we update the current PCB to accurately represent it in the OS
        loadAccConst() {
            this.PC++;
            this.Acc = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadAccMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Acc = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        storeAccMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            _MemoryAccessor.writeMem(this.currentPCB, addr, this.Acc);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        addWithCarry() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Acc += _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadXConst() {
            this.PC++;
            this.Xreg = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadXMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Xreg = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadYConst() {
            this.PC++;
            this.Yreg = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadYMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Yreg = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        breakOp() {
            this.PC++;
            this.isExecuting = false;
            this.currentPCB.terminatePCB();
            //this.currentPCB = null;
            // Schedule the next task
            _Kernel.krnTrace(`Process ${this.currentPCB.pid} complete`);
            this.currentPCB = null;
            _Scheduler.scheduleRR();
        }
        compByteToX() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            if (this.Xreg === _MemoryAccessor.readMem(this.currentPCB, addr)) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        branchNifZisZero() {
            this.PC++;
            if (this.Zflag === 0) {
                let branch = _MemoryAccessor.readMem(this.currentPCB, this.PC);
                this.PC += branch;
                // In the case of overflow, we use Modulo to set the branch
                if (this.PC > 0x100) {
                    this.PC = this.PC % 0x100;
                }
            }
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        incrementByte() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            let val = _MemoryAccessor.readMem(this.currentPCB, addr);
            val++;
            _MemoryAccessor.writeMem(this.currentPCB, addr, val);
            this.PC++;
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        sysCall() {
            this.PC++;
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                let str = '';
                let addr = this.Yreg;
                let val = 0;
                do {
                    val = _MemoryAccessor.readMem(this.currentPCB, addr);
                    addr += 1;
                    str += String.fromCharCode(val);
                } while (val !== 0x00);
                _StdOut.putText(str);
            }
            //this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map