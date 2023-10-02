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
        constructor(PC = 0, instruReg = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false, currentPCB = null) {
            this.PC = PC;
            this.instruReg = instruReg;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.currentPCB = currentPCB;
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
            // First we find if our PCB exists...
            //if (_MemoryManager.pcbArr.pid.indexOf(pid) === -1) {
            // ... then we load our PCB into the CPU, set the instruction register, and then execute the program
            this.currentPCB = _MemoryManager.pcbArr[pid];
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag);
            // Our CPU is now executing a program, so it 'isExecuting'
            this.isExecuting = true;
            //}
        }
        cycle() {
            if (this.isExecuting) {
                _Kernel.krnTrace('CPU cycle');
                // Fetches instruction
                let instruction = _MemoryAccessor.readMem(this.currentPCB, this.PC);
                alert(instruction.toString(16));
                // Executes appropiate function based on OP code
                switch (instruction) {
                    case 0xA9:
                        this.loadAccConst();
                        break;
                    case 0xAD:
                        this.loadAccMem();
                        break;
                    case 0x00:
                        this.breakOp();
                        break;
                    default:
                        _StdOut.putText("Invalid instruction found. Go study assembly");
                        break;
                }
            }
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Devices.hostUpdateCpuDisplay();
        }
        // 6502 Op Code functions
        loadAccConst() {
            this.PC++;
            this.Acc = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
        }
        loadAccMem() {
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Acc = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
        }
        storeAccMem(value) {
            this.PC++;
        }
        addWithCarry() {
            this.PC++;
        }
        loadXConst(value) {
            this.PC++;
        }
        loadXMem() {
            this.PC++;
        }
        loadYConst(value) {
            this.PC++;
        }
        loadYMem() {
            this.PC++;
        }
        noOp() {
            this.PC++;
        }
        breakOp() {
            this.isExecuting = false;
            this.currentPCB.state = "Terminated";
            this.currentPCB = null;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
        }
        compByteToX(value) {
            this.PC++;
        }
        branchNifZisZero() {
            this.PC++;
        }
        incrementByte() {
            this.PC++;
        }
        sysCall() {
            this.PC++;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map