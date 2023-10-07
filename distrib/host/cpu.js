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
        constructor(PC = 0, instruReg = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false, currentPCB = null, singleStep = false) {
            this.PC = PC;
            this.instruReg = instruReg;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.currentPCB = currentPCB;
            this.singleStep = singleStep;
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
        runProgram(pid) {
            // ... then we load our PCB into the CPU and then execute the program
            this.currentPCB = _MemoryManager.pcbArr[pid];
            this.isExecuting = true;
        }
        killProgram() {
            // Used for ctrl-c until I better understand interrupts. Right now, it just uses the BRK op code as it 'breaks' the current program
            this.breakOp();
        }
        cycle() {
            if (this.isExecuting && this.currentPCB !== null) {
                _Kernel.krnTrace('CPU cycle');
                // 'Fetches' instruction
                let instruction = _MemoryAccessor.readMem(this.currentPCB, this.PC);
                this.instruReg = instruction;
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
                        break;
                    case 0xFF:
                        this.sysCall();
                        break;
                    default:
                        _StdOut.putText("Invalid instruction found. Go study assembly");
                        this.isExecuting = false;
                        break;
                }
            }
            TSOS.Devices.hostUpdateCpuDisplay();
            TSOS.Devices.hostUpdateMemDisplay();
            // If single step is enabled, CPU stops executing per cycle until step is pressed
            if (this.singleStep === true) {
                this.isExecuting = false;
            }
        }
        // 6502 Op Code functions
        loadAccConst() {
            this.PC++;
            this.Acc = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadAccMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Acc = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        storeAccMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            _MemoryAccessor.writeMem(this.currentPCB, addr, this.Acc);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        addWithCarry() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Acc += _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadXConst() {
            this.PC++;
            this.Xreg = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadXMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Xreg = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadYConst() {
            this.PC++;
            this.Yreg = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        loadYMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Yreg = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        breakOp() {
            this.isExecuting = false;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Terminated");
            this.currentPCB = null;
            _MemoryManager.clearMem();
        }
        compByteToX() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            if (this.Xreg === _MemoryAccessor.readMem(this.currentPCB, this.PC)) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        branchNifZisZero() {
            this.PC++;
            if (this.Zflag === 0) {
                let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
                this.PC++;
                let branch = _MemoryAccessor.readMem(this.currentPCB, addr);
                this.PC += branch;
            }
            else {
                this.PC++;
            }
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        incrementByte() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            let val = _MemoryAccessor.readMem(this.currentPCB, addr);
            val++;
            _MemoryAccessor.writeMem(this.currentPCB, addr, val);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
        sysCall() {
            if (this.Xreg === 1) {
                this.PC++;
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                let str = '';
                let addr = this.Yreg;
                let val = _MemoryAccessor.readMem(this.currentPCB, addr);
                while (val !== 0x00) {
                    let char = String.fromCharCode(val);
                    str += char.toString();
                    addr++;
                    val = _MemoryAccessor.readMem(this.currentPCB, addr);
                }
                _StdOut.putText(str);
            }
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map