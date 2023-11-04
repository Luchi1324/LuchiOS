var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() {
        }
        // Facilitates context switching
        contextSwitch() {
            // If we have tasks that are ready and our CPU isn't executing anything ...
            if (_Scheduler.readyQueue.getSize() > 0 && _CPU.currentPCB === null) {
                // ... we get our next task that is ready and load it into the CPU.
                let oldTask = _Scheduler.executingPCB;
                let nextTask = _Scheduler.readyQueue.dequeue();
                // Logging context switch to the kernel trace
                _Kernel.krnTrace(`Switching from PID ${oldTask.pid} to PID ${nextTask.pidts}`);
                _Scheduler.executingPCB = nextTask;
                _CPU.loadProgram(nextTask);
                // If the CPU is executing and a context switch is called ...
            }
            else if (_Scheduler.readyQueue.getSize() > 0) {
                // ... then we update the current process and shove it back in the ready queue...
                _Scheduler.executingPCB.state = "Ready";
                _Scheduler.readyQueue.enqueue(_Scheduler.executingPCB);
                TSOS.Devices.hostUpdatePcbDisplay(_Scheduler.executingPCB);
                // ... and get the next one and load it into the CPU.
                let nextTask = _Scheduler.readyQueue.dequeue();
                _Scheduler.executingPCB = nextTask;
                _CPU.loadProgram(nextTask);
            }
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map