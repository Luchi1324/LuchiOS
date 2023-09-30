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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            if (this.isExecuting) {
                
            }
        }

        // 6502 Op Code functions
        // TODO: Add op code functionality once I get memoryAccessor and manager working

        public loadAccConst(value: number) { // A9 (LDA)
            this.Acc = value;
            this.PC++;
        }

        public loadAccMem(num1: number, num2: number) { // AD (LDA)
            this.PC++;
        }

        public storeAccMem(value: number) { // 8D (STA)
            this.PC++
        }

        public addWithCarry() { // 6D (ADC)
            this.PC++
        }

        public loadXConst(value: number) { // A2 (LDX)
            this.PC++
        }

        public loadXMem() { // AE (LDX)
            this.PC++
        }

        public loadYConst(value: number) { // A0 (LDY)
            this.PC++
        }

        public loadYMem() { // AC (LDY)
            this.PC++
        }

        public noOp() { // EA (NOP)
            this.PC++
        }

        public break() {  // 00 (BRK)
            this.PC++
        }

        public compByteToX(value: number) { // EC (CPX)
            this.PC++
        }

        public branchNifZisZero() { // D0 (BNE)
            this.PC++
        }

        public incrementByte() { // EE (INC)
            this.PC++
        }

        public sysCall() { // FF (SYS)
            this.PC++
        }
    }
}
