var TSOS;
(function (TSOS) {
    class Scheduler {
        scheduleMode;
        readyQueue;
        quantum;
        quantaCount;
        executingPCB;
        constructor(scheduleMode = 'rr', readyQueue = new TSOS.Queue(), quantum = 6, quantaCount = 1, executingPCB = null) {
            this.scheduleMode = scheduleMode;
            this.readyQueue = readyQueue;
            this.quantum = quantum;
            this.quantaCount = quantaCount;
            this.executingPCB = executingPCB;
        }
        init() {
            this.scheduleMode = 'rr';
            this.readyQueue = new TSOS.Queue();
            this.quantum = 6;
            this.quantaCount = 0;
            this.executingPCB = null;
        }
        schedule() {
            switch (this.scheduleMode) {
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
        scheduleRR() {
            // If we have a process in the ready queue ...
            if (this.readyQueue.getSize() > 0) {
                // ... we generate our interrupt to trigger a context switch.
                _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
            }
            else {
                // TODO: Insert more code to handle empty ready queue
                _StdOut.putText("All processes have been completed.");
                // Once we have finsihed executing everything, then we erase the PCB list
                //_PCBList = [];
            }
        }
        quantaCheck() {
            this.quantaCount++;
            if (this.quantaCount % this.quantum === 0) {
                _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map