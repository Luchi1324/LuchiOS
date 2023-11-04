module TSOS {
    export class Scheduler {
        public readyQueue: Queue;
        public quantum: number;
        public quantaCount: number;
        public executingPCB: ProcessControlBlock;

        constructor() {
            this.readyQueue = new Queue();
            this.quantum = 6;
            this.quantaCount = 1;
            this.executingPCB = null;
        }

        public scheduleRR(): void {
            alert("Scheduling!");
            // If we don't have a process executing and it is in the ready queue ...
            if (this.executingPCB === null && this.readyQueue.getSize() > 0) {
                // ... then we load it into the CPU
                alert("Loading!");
                this.executingPCB = this.readyQueue.dequeue();
                _CPU.loadProgram(this.executingPCB);
            } else if (this.readyQueue.getSize() > 0) {
                // Otherwise if we have reached our Quantum ...
                if (this.quantaCount % this.quantum === 0) {
                    alert("Interrupting!");
                    _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
                }
            } else {
                _StdOut.putText("There is nothing in the ready queue to schedule.")
            }
        }
    }
}