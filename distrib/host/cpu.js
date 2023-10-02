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
        Acc;
        Xreg;
        Yreg;
        Zflag;
        isExecuting;
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        loadProgram(pcb) {
            this.PC = pcb.pc;
            this.Acc = pcb.acc;
            this.Xreg = pcb.XReg;
            this.Yreg = pcb.YReg;
            this.Zflag = pcb.ZFlag;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            if (this.isExecuting) {
            }
        }
        // 6502 Op Code functions
        loadAccConst(value) {
            this.Acc = value;
            this.PC++;
        }
        loadAccMem(num1, num2) {
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
        break() {
            this.PC++;
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