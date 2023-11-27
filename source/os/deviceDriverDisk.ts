module TSOS {
    export class DeviceDriverDisk extends DeviceDriver {

        constructor() {
            super();
            this.driverEntry = this.krnKdbDriverEntry;
        }

        public krnKdbDriverEntry(): void {
            this.status = "loaded";
        }

        // Creates an empty block
        public createEmptyBlock(): string {
            return "0".repeat(4) + ":" + "0".repeat(_Disk.blockSize-4);
        }

        // Creates a storage key to use with sessionStorage
        public createStorageKey(track: number, sector: number, block: number): string {
            return track.toString() + sector.toString() + block.toString();
        }

        public formatDisk(): void {
            _Kernel.krnTrace("Beginning disk format...");
            for (var t = 0; t < _Disk.numTracks; t++) {
                for (var s = 0; s < _Disk.numSectors; s++) {
                    for (var b = 0; b < _Disk.numBlocks; b++) {
                        sessionStorage.setItem(this.createStorageKey(t, s, b), this.createEmptyBlock());
                    }
                }
            }
            _Disk.isFormatted = true;
            _Kernel.krnTrace("Disk formatted.");
            Devices.hostUpdateDiskDisplay();
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