module TSOS {
    export class DeviceDriverDisk extends DeviceDriver {

        constructor(public disk: Disk = new Disk()) {
            super();
            this.driverEntry = this.krnKdbDriverEntry;
        }

        public krnKdbDriverEntry(): void {
            this.status = "loaded";
        }

        public formatDisk(): void {
            _Kernel.krnTrace("Beginning disk format.");
            // TODO: Create a block creator
            for (var t = 0; t < this.disk.numTracks; t++) {
                for (var s = 0; s < this.disk.numSectors; s++) {
                    for (var b = 0; b < this.disk.numBlocks; b++) {
                        // TODO: Figure out HTML5 Storage, and creating storage keys so I can make every block empty
                    }
                }
            }
            this.disk.isFormatted = true;
            _Kernel.krnTrace("Disk formatted.");
            // TODO: Create a disk table function, then insert it here
        }

        public createFile(fileName: string) {

        }

        public readFile(fileName: string) {
            
        }
    }
}