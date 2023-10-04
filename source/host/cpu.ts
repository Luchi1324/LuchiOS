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
                    public instruReg: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public currentPCB = null,
                    public singleStep = false) {

        }

        public init(): void {
            this.PC = 0;
            this.instruReg = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentPCB = null;
        }

        public runProgram(pid: number): void {
            // ... then we load our PCB into the CPU, set the instruction register, and then execute the program
            this.currentPCB = _MemoryManager.pcbArr[pid];
            //this.currentPCB.updatePCB(this.currentPCB.PC, this.currentPCB.acc, this.currentPCB.XReg, this.currentPCB.YReg, this.currentPCB.ZFlag, "Executing");

            // Our CPU is now executing a program, so it 'isExecuting'
            //this.currentPCB.state = "Executing";
            //Devices.hostUpdatePcbDisplay(this.currentPCB);
            this.isExecuting = true;
        }

        public cycle(): void {
            if (this.isExecuting && this.currentPCB !== null) {
                _Kernel.krnTrace('CPU cycle');
                // Fetches instruction
                let instruction = _MemoryAccessor.readMem(this.currentPCB, this.PC);
                this.instruReg = instruction;

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

            Devices.hostUpdateCpuDisplay();

            // If single step is enabled, CPU stops executing per cycle until step is pressed
            if (this.singleStep === true) {
                this.isExecuting = false;
            }
        }

        // 6502 Op Code functions

        private loadAccConst() { // A9 (LDA)
            this.PC++;
            this.Acc = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private loadAccMem() { // AD (LDA)
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Acc = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private storeAccMem(value: number) { // 8D (STA)
            this.PC++
        }

        private addWithCarry() { // 6D (ADC)
            this.PC++
        }

        private loadXConst(value: number) { // A2 (LDX)
            this.PC++
        }

        private loadXMem() { // AE (LDX)
            this.PC++
        }

        private loadYConst(value: number) { // A0 (LDY)
            this.PC++
        }

        private loadYMem() { // AC (LDY)
            this.PC++
        }

        private noOp() { // EA (NOP)
            this.PC++
        }

        private breakOp() {  // 00 (BRK)
            this.isExecuting = false;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Terminated");
            this.currentPCB = null;
        }

        private compByteToX(value: number) { // EC (CPX)
            this.PC++
        }

        private branchNifZisZero() { // D0 (BNE)
            this.PC++
        }

        private incrementByte() { // EE (INC)
            this.PC++
        }

        private sysCall() { // FF (SYS)
            this.PC++
        }
    }
}
