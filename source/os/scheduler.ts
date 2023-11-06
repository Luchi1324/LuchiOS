module TSOS {
    export class Scheduler {
        constructor(public readyQueue: Queue = new Queue(),
                    public quantum: number = 6,
                    public quantaCount: number = 1,
                    public executingPCB = null){
        }

        public init(): void {
            this.readyQueue = new Queue();
            this.quantum = 6;
            this.quantaCount = 0;
            this.executingPCB = null;
        }

        public scheduleRR(): void {
            //_StdOut.putText(`${this.quantaCount}`);
            // If we don't have a process executing and it is in the ready queue ...
            if (this.executingPCB === null && this.readyQueue.getSize() > 0) {
                // ... then we load it into the CPU
                this.executingPCB = this.readyQueue.dequeue();
                _CPU.loadProgram(this.executingPCB);
            } else if (this.readyQueue.getSize() > 0) {
                // Otherwise if we have reached our Quantum ...
                //if (this.quantaCount === this.quantum) {
                    if (this.quantaCount % this.quantum === 0) {
                    _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
                    //this.quantaCount = 0;
                }
            }
        }
    }
}