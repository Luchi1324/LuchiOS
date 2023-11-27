module TSOS {
    export class DeviceDriverDisk extends DeviceDriver {

        constructor(public disk: Disk = new Disk()) {
            super();
            this.driverEntry = this.krnKdbDriverEntry;
        }

        public krnKdbDriverEntry(): void {
            this.status = "loaded";
        }

        // Creates an empty block
        public createEmptyBlock():string {
            return "0".repeat(4) + ":" + "0".repeat(this.disk.blockSize-4);
        }

        // Creates a storage key to use with sessionStorage
        public createStorageKey(track: number, sector: number, block: number): string {
            return track.toString() + sector.toString() + block.toString();
        }

        public formatDisk(): void {
            _Kernel.krnTrace("Beginning disk format...");
            for (var t = 0; t < this.disk.numTracks; t++) {
                for (var s = 0; s < this.disk.numSectors; s++) {
                    for (var b = 0; b < this.disk.numBlocks; b++) {
                        sessionStorage.setItem(this.createStorageKey(t, s, b), this.createEmptyBlock());
                    }
                }
            }
            this.disk.isFormatted = true;
            _Kernel.krnTrace("Disk formatted.");
            // TODO: Create a disk table function, then insert it here
        }

        public createFile(fileName: string) {
            let createdFlag: boolean = false;

        }

        public readFile(fileName: string) {

        }
        
        public writeFile(fileName: string) {

        }

        public deleteFile(fileName: string) {

        }

        public copyFile(fileName: string, newFileName: string) {

        }

        public renameFile(fileName: string, newFileName: string) {

        }

        public getAllFiles() {

        }
    }
}