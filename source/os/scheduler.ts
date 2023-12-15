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
                    this.scheduleFCFS();
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
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
        }

        public scheduleFCFS(): void {
            // FCFS works the same as RR, just with an infinitely large quantum
            this.quantum = Number.MAX_VALUE;
            this.scheduleRR();
        }

        // TODO: Get this working
        public scheduleNPP(): void {
            this.quantum = Number.MAX_VALUE;
            // Finds highest priority by dequeuing contents of ready queue into a temp queue...
            let tempQueue: Queue = new Queue();
            let maxPriority: number = 32;
            let priorityPID: number = 0;

            // ... checking the priority of each task ...
            for (let i = 0; i < _MemoryManager.readyQueue.getSize(); i++) {
                let task = _MemoryManager.readyQueue.dequeue();
                if (task.priority < maxPriority) {
                    maxPriority = task.priority;
                    priorityPID = task.pid;
                }
                tempQueue.enqueue(task);
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