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
                    public singleStep = false,
                    public stepPulse = false) {

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
            // We load our PCB into the CPU and then execute the program
            this.currentPCB = _MemoryManager.pcbArr[pid];
            this.isExecuting = true;
        }

        public killProgram(): void {
            // Used for ctrl-c until I better understand interrupts. Right now, it just uses the BRK op code as it 'breaks' the current program
            this.breakOp();
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public cycle(): void {
            if (this.isExecuting && this.currentPCB !== null) {
                _Kernel.krnTrace('CPU cycle');
                // 'Fetches' instruction
                let instruction = _MemoryAccessor.readMem(this.currentPCB, this.PC);
                this.instruReg = instruction;
                Devices.hostUpdateMemDisplay(true, this.PC);

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
                        _StdOut.advanceLine();
                        _OsShell.putPrompt();
                        this.isExecuting = false;
                        break;
                }
            }

            Devices.hostUpdateCpuDisplay();
        }

        // 6502 Op Code functions

        // All of the functions follow a similar procedure, and is private since only the CPU needs these functions
        // Everytime the CPU reads a memory address or does something, the program counter goes up by one 
        // At the end of every function, we update the current PCB to accurately represent it in the OS
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

        private storeAccMem() { // 8D (STA)
            this.PC++
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++
            _MemoryAccessor.writeMem(this.currentPCB, addr, this.Acc);
            this.PC++
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private addWithCarry() { // 6D (ADC)
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Acc += _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private loadXConst() { // A2 (LDX)
            this.PC++;
            this.Xreg = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private loadXMem() { // AE (LDX)
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Xreg = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private loadYConst() { // A0 (LDY)
            this.PC++;
            this.Yreg = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private loadYMem() { // AC (LDY)
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            this.Yreg = _MemoryAccessor.readMem(this.currentPCB, addr);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private breakOp() {  // 00 (BRK)
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Terminated");
            this.currentPCB = null;
            _MemoryManager.clearMem();
            this.isExecuting = false;
        }

        private compByteToX() { // EC (CPX)
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            if (this.Xreg === _MemoryAccessor.readMem(this.currentPCB, addr)) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private branchNifZisZero() { // D0 (BNE)
            this.PC++;
            if (this.Zflag === 0) {
                let branch = _MemoryAccessor.readMem(this.currentPCB, this.PC);
                this.PC += branch;
                // Got this modulo from Cybercore hall of fame, fixes it, but I have no idea why
                // TODO: Understand why the hell this works
                this.PC = this.PC % 0x100;
            }
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private incrementByte() { // EE (INC)
            this.PC++;
            let addr = _MemoryAccessor.readMem(this.currentPCB, this.PC);
            this.PC++;
            let val = _MemoryAccessor.readMem(this.currentPCB, addr);
            val++;
            _MemoryAccessor.writeMem(this.currentPCB, addr, val);
            this.PC++;
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }

        private sysCall() { // FF (SYS)
            if (this.Xreg === 1) {
                this.PC++;
                _StdOut.putText(this.Yreg.toString());
            } else if (this.Xreg === 2) {
                let str = '';
                let addr = this.Yreg;
                let val = 0;
                do {
                    val = _MemoryAccessor.readMem(this.currentPCB, addr);
                    addr += 1;
                    str += String.fromCharCode(val);
                } while (val !== 0x00);
                _StdOut.putText(str);
                this.PC++;
            }
            this.currentPCB.updatePCB(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag, "Executing");
        }
    }
}
