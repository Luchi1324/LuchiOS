module TSOS {
    export class Scheduler {
        constructor(public scheduleMode: String = 'rr',
                    public readyQueue: Queue = new Queue(),
                    public quantum: number = 6,
                    public quantaCount: number = 1,
                    public executingPCB = null){
        }

        public init(): void {
            this.scheduleMode = 'rr';
            this.readyQueue = new Queue();
            this.quantum = 6;
            this.quantaCount = 0;
            this.executingPCB = null;
        }

        public schedule(): void {
            switch(this.scheduleMode) {
                case 'rr':
                    this.scheduleRR();
                    break;
                case 'fcfs':
                    // TODO: Create a FCFS scheduling algorithm
                    break;
                case 'npp':
                    // TODO: Create a non-preemptive priority scheduling algorithm
                    break;
            }
        }

        public scheduleRR(): void {
            // If we have a process in the ready queue ...
            if (this.readyQueue.getSize() > 0) {
                // ... we generate our interrupt to trigger a context switch.
                _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
            } else {
                // TODO: Insert more code to handle empty ready queue
                _StdOut.putText("All processes have been completed.");
                // Once we have finsihed executing everything, then we erase the PCB list
                //_PCBList = [];
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