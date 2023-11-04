/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        // Properties
        promptStr = ">";
        commandList = [];
        curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        apologies = "[sorry]";
        constructor() {
        }
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version.");
            this.commandList[this.commandList.length] = sc;
            // fver TODO: Get text wrap working so this displays properly
            sc = new TSOS.ShellCommand(this.shellFancyVer, "fver", "- Displays the current version, but with spice.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Changes the status above");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Triggers a BSOD.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates the code in the User Program Input area.");
            this.commandList[this.commandList.length] = sc;
            // run <pid>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Runs a program in memory.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Runs all the programs in memory.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clears everyting stored in memory.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays your current position.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- Prints PID and states of all processes.");
            this.commandList[this.commandList.length] = sc;
            // kill <id> - kills the specified process id
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Kills a process that is currently executing.");
            this.commandList[this.commandList.length] = sc;
            // killall - kills all the processes currently executing or ready
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- Kills all of the processes executing or ready.");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                topic = args.join(' ');
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("This displays the name and the current version of the os.");
                        break;
                    case "status":
                        _StdOut.putText("Changes a patch of text on the top of the OS. Enter 'status' followed by the string of your choice");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown, well, shuts down the virtual os once entered.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen and resets the cursor once entered.");
                        break;
                    case "man":
                        _StdOut.putText("Put a topic after man and it will display the MANual page for said topic. Also you called it twice, don't call it a third time.");
                        break;
                    case "man man":
                        _StdOut.putText("I warned you. Now this computer is going to crash after 3 seconds. Fuck around and find out :)");
                        setTimeout(() => {
                            _Kernel.krnTrapError('You called man three times, you fucked around and found out.');
                        }, 3000);
                        break;
                    case "trace":
                        _StdOut.putText("Enables or disables the OS trace. Enter this followed by 'on' or 'off' to enable or disable this respectively.");
                        break;
                    case "rot13":
                        _StdOut.putText("Performs rot13 obfuscation on an entered string. It will output the obfuscated string (You can put it back in to reverse it!)");
                        break;
                    case "load":
                        _StdOut.putText("Validates the code in the User Program Input Area");
                        break;
                    case "run":
                        _StdOut.putText("Runs a program that is already in memory. Enter this followed by the pid.");
                    case "runall":
                        _StdOut.putText("Runs all programs currently loaded in memory.");
                    case "kill":
                        _StdOut.putText("Kills a process that is currently executing. Enter this followed by the pid.");
                    case "killall":
                        _StdOut.putText("Kills all processes currently executing or ready in the CPU.");
                    case "clearmem":
                        _StdOut.putText("Erases everything currently stored in memory. Warning: this will break any program/s that are currently executing.");
                    case "ps":
                        _StdOut.putText("Prints out the PIDs and states of all processes");
                    case "prompt":
                        _StdOut.putText("Changes the shell input character with a given string. Enter 'prompt' followed by your string of choice.");
                        break;
                    case "date":
                        _StdOut.putText("Outputs the current date and time in MM/DD/YYYY HH:MM.SS.");
                    case "whereami":
                        _StdOut.putText("Outputs the current location of your comouter in lattitude and longitude.");
                    case "bsod":
                        _StdOut.putText("Forces the Kernal to capture a non-existent error, and triggers the screen nobody wants to see.");
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate(args) {
            const time = new Date();
            _StdOut.putText(`The current date and time is ${time.toLocaleString()}`);
        }
        shellWhereAmI(args) {
            // Navigator code used from Chrome documentation and https://www.w3schools.com/jsref/prop_nav_geolocation.asp
            // Please give me the 5 marks I missed for this ;-;
            _StdOut.putText('You are on your computer, on planet earth.');
        }
        shellLoad(args) {
            let flag = true;
            // I don't remember where I found the <HTMLInputElement> but it was the only thing that got this stupid .value working
            // This took nearly an hour alone, the text is starting to dance on my screen
            let input = document.getElementById("taProgramInput").value;
            // No point in running the function if the field is empty
            if (input.length != 0) {
                for (let i = 0; i < input.length; i++) {
                    let chCode = input.charCodeAt(i);
                    // Skip spaces (ChatGPT gave me this idea, everything else is my own)
                    if (chCode === 32) {
                        continue;
                    }
                    // Check for invalid characters
                    if (!(chCode >= 48 && chCode <= 57) && // 0-9
                        !(chCode >= 65 && chCode <= 70) && // A-F
                        !(chCode >= 97 && chCode <= 102) // a-f
                    ) {
                        flag = false;
                        break;
                    }
                }
                if (flag !== true) {
                    _StdOut.putText("Invalid User Program Input.");
                }
                else {
                    _StdOut.putText("Valid User Program Input! Loading...");
                    // Coverts input array to hex numbers so it can be loaded as a program
                    let inputArray = input.split(' ');
                    let program = [];
                    for (let i = 0x000; i < inputArray.length; i++) {
                        program.push(parseInt(inputArray[i], 16));
                    }
                    let loadedMem = _MemoryManager.loadMem(program);
                    if (loadedMem === true) {
                        let loadedPid = TSOS.ProcessControlBlock.currentPID;
                        TSOS.Devices.hostUpdateMemDisplay();
                        _StdOut.putText(" Loaded!");
                        // Returns the created PCB's PID
                        _StdOut.advanceLine();
                        _StdOut.putText(`PID: ${loadedPid}`);
                    }
                    else {
                        _StdOut.advanceLine();
                        _StdOut.putText("All memory segments are currently allocated. There isn't a hard drive yet so go run some programs.");
                    }
                }
            }
            else {
                _StdOut.putText("User Program Input is empty. Don't leave it empty :(");
            }
        }
        shellRun(args) {
            if (args.length > 0) {
                let pid = parseInt(args[0]);
                _CPU.runProgram(pid);
            }
            else {
                _StdOut.putText("Usage: run <pid> Please supply a PID.");
            }
        }
        shellRunAll(args) {
            _CPU.runAllPrograms();
        }
        shellKill(args) {
            if (args.length > 0) {
                let pid = parseInt(args[0]);
                _Kernel.krnKillTask(pid);
            }
            else {
                _StdOut.putText("Usage: kill <pid> Please supply a PID.");
            }
        }
        shellKillAll(args) {
            if (!(_CPU.isExecuting)) {
                for (let i = 0; i < _MemoryManager.residentTasks.length; i++) {
                    _Kernel.krnKillTask(_MemoryManager.residentTasks[i].pid);
                }
            }
            else {
                _StdOut.putText("There are no processes running to kill.");
            }
        }
        shellPs(args) {
            for (let i = 0; i < _MemoryManager.residentTasks.length; i++) {
                _StdOut.putText(`PID: ${_MemoryManager.residentTasks[i].pid} -- State: ${_MemoryManager.residentTasks[i].state}`);
                _StdOut.advanceLine();
            }
        }
        shellClearMem(args) {
            _StdOut.putText("Clearing Memory...");
            _MemoryManager.clearMem();
        }
        shellBSOD(args) {
            _Kernel.krnTrapError('Called from CLS.');
        }
        shellStatus(args) {
            let status;
            if (args.length > 0) {
                // Noticed the .join from the CyberCore hall of fame, I was going to use a for loop to get the args[i]
                status = args.join(' ');
                _StdOut.putText(`Set status to '${status}'`);
                document.getElementById('divStatus').innerHTML = status;
            }
            else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        }
        // TODO: Make the ASCII art smaller
        shellFancyVer(args) {
            _StdOut.putText("  _                             _       __      ____      ___        ____         _  _    ");
            _StdOut.putText("  FJ        _    _     ____     FJ___    LJ     F __ ]    F __\".     F _  ]       FJ  L] ");
            _StdOut.putText(" J |       J |  | L   F ___J.  J  __ `.        J |--| L  J (___|    J |/ | L     J |__| L ");
            _StdOut.putText(" | |       | |  | |  | |---LJ  | |--| |  FJ    | |  | |  J\___ \    | | /| |     |____  | ");
            _StdOut.putText(" F L_____  F L__J J  F L___--. F L  J J J  L   F L__J J .--___) \   F  /_J J  __ L____J J ");
            _StdOut.putText("J________LJ\____,__LJ\______/FJ__L  J__LJ__L  J\______/FJ\______J  J\______/FJ__L     J__L");
            _StdOut.putText("|________| J____,__F J______F |__L  J__||__|   J______F  J______F   J______F |__|     J__|");
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map