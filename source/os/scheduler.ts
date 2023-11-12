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
                _StdOut.putText("All processes have been completed.");
                // Reset residentTask array after all tasks have been executed
                _MemoryManager.residentTasks = [];
                _StdOut.advanceLine();
                _OsShell.putPrompt();
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