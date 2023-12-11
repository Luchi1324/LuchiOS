var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() {
        }
        // Facilitates context switching
        contextSwitch() {
            // If we have tasks that are ready and our CPU isn't executing anything ...
            if (_CPU.currentPCB === null) {
                // ... we get our next task that is ready and load it into the CPU.
                let newTask = _Scheduler.readyQueue.dequeue();
                // Logging context switch to the kernel trace
                _Kernel.krnTrace(`Loading new PID ${newTask.pid}`);
                _Scheduler.executingPCB = newTask;
                _CPU.loadProgram(newTask);
                // If the CPU is executing and a context switch is called ...
            }
            else if (_Scheduler.readyQueue.getSize() > 0) {
                // ... then we update the current process and shove it back in the ready queue...
                let oldTask = _Scheduler.executingPCB;
                oldTask.state = "Ready";
                _Scheduler.readyQueue.enqueue(oldTask);
                TSOS.Devices.hostUpdatePcbDisplay(oldTask);
                // ... increment waiting and turnaround cycles
                oldTask.waitCycles++;
                oldTask.turnCycles++;
                // ... and get the next one and load it into the CPU.
                let nextTask = _Scheduler.readyQueue.dequeue();
                _Scheduler.executingPCB = nextTask;
                // If it's loaded from disk, we need to roll out the old task to disk then the next one to memory
                if (nextTask.location === 'Disk') {
                    //let swapPCB = _Scheduler.readyQueue.getLast();
                    _Kernel.krnTrace(`Context Switch: Moving PID: ${oldTask.pid} to disk and loading PID: ${oldTask.pid} to memory.`);
                    _Swapper.rollOut(oldTask);
                    _Swapper.rollIn(nextTask);
                }
                // Logging context switch to the kernel trace
                _Kernel.krnTrace(`Context Switch: Swapping from PID: ${oldTask.pid} to PID: ${nextTask.pid}`);
                _CPU.loadProgram(nextTask);
            }
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map