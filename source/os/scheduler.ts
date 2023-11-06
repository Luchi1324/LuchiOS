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
            // If we don't have a process executing and it is in the ready queue ...
            if (this.readyQueue.getSize() > 0) {
                _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
            } else {
                // TODO: Insert more code to handle empty ready queue
                _StdOut.putText("There are no processes in the ready queue.")
            }
        }

        public quantaCheck(): void {
            this.quantaCount++;
            if (this.quantaCount % this.quantum === 0) {
                _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
            }
        }
    }
}