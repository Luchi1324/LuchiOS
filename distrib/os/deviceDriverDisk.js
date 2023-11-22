var TSOS;
(function (TSOS) {
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        disk;
        constructor(disk = new TSOS.Disk()) {
            super();
            this.disk = disk;
            this.driverEntry = this.krnKdbDriverEntry;
        }
        krnKdbDriverEntry() {
            this.status = "loaded";
        }
        formatDisk() {
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
        createFile(fileName) {
        }
        readFile(fileName) {
        }
        writeFile(fileName) {
        }
        deleteFile(fileName) {
        }
        copyFile(fileName, newFileName) {
        }
        renameFile(fileName, newFileName) {
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map