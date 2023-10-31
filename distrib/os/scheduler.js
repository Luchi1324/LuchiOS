var TSOS;
(function (TSOS) {
    class Scheduler {
        readyQueue;
        quantum;
        quantaCount;
        executingPCB;
        constructor() {
            this.readyQueue = new TSOS.Queue();
            this.quantum = 6;
            this.quantaCount = 0;
            this.executingPCB = null;
        }
        scheduleRR() {
            if (this.executingPCB === null && this.readyQueue.getSize() > 0) {
                this.executingPCB = this.readyQueue.dequeue();
                _CPU.loadProgram(this.executingPCB);
            }
            else if (this.readyQueue.getSize() > 0) {
                if ((this.quantaCount + 1) % this.quantum === 0) {
                    _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
                }
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map