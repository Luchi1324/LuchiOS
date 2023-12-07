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

            let fileKey = this.getNextDirBlockKey();
            // Get the next available data block and set it at the end of the file chain
            let nextKey = this.getNextDataBlockKey();
            this.setFinalDataBlock(nextKey);

            // Put the file name in the file block
            let file = sessionStorage.getItem(fileKey);
            sessionStorage.setItem(fileKey, Utils.replaceAt(file, 5, Utils.txtToHex(fileName)));

            // Put the key of the file starting block in the file meta data
            file = sessionStorage.getItem(fileKey);
            sessionStorage.setItem(fileKey, Utils.replaceAt(file, 1, nextKey))

            createdFlag = true;
            Devices.hostUpdateDiskDisplay();
            
            return createdFlag;
        }

        public readFile(fileName: string) {
            let startingBlockKey = this.findFile(fileName)[1];
            let str = '';

            if (!startingBlockKey) {
                str = null;
            } else {
                let block = sessionStorage.getItem(startingBlockKey);
                let blockArr = block.split(':');
                let meta = blockArr[0];
                let data = blockArr[1];

                str += this.readBlockData(data);

                // File contains more than 1 block
                if (meta.slice(1,4) != '---') {
                    let nextKey = meta.slice(1,4);
                    let nextData = sessionStorage.getItem(nextKey);

                    while (nextKey != '---') {
                        str += this.readBlockData(nextData.split(':')[1]);
                        nextKey = nextData.split(':')[0].slice(1,4);
                        nextData = sessionStorage.getItem(nextKey);
                    }
                }
            }
            return str;
        }

        public readBlockData(data: string): string {
            // split the data into an array of hex pairings (regex: every 2 characters)
            let hexArr = data.match(/.{1,2}/g);
            let block = '';
            let i = 0;
            // loop through array and build block string
            while (i < hexArr.length) {
                block += hexArr[i];
                i++;
            }
            return block;
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

        public findFile(fileName): string[] {
            let startingBlockKey = null;
            let fileArr = [];

            directorySearch:
            for (let t = 0; t < 1; t++) {
                for (let s = 0; s < _Disk.numSectors; s++) {
                    for (let b = 0; b < _Disk.numBlocks; b++) {
                        let potentialKey = this.createStorageKey(t, s, b);
                        let dataArr = sessionStorage.getItem(potentialKey).split(":");

                        if (dataArr) {
                            let meta = dataArr[0];
                            let fileData = this.trimData(dataArr[1]);
                            let isUsed = this.checkIfInUse(meta);

                            if (isUsed && this.readBlockData(fileData) == (Utils.txtToHex(fileName))) {
                                startingBlockKey = meta.slice(1,4);
                                // directory key
                                fileArr.push(potentialKey);
                                // starting block key
                                fileArr.push(meta.slice(1,4));
                                break directorySearch;
                            }
                        }
                    }
                }
            }
            return fileArr;
        }

        // Helper Functions

        public trimData(data: string): string {
            let hexArr = data.match(/.{1,2}/g);
            let i = 0;
            let res = ''
            while (i < hexArr.length) {
                if (hexArr[i] != '00') {
                    res += hexArr[i];
                } else {
                    break;
                }
                i++;
            }
            return res;
        }

        // Returns key of next available block
        public getNextDataBlockKey():string {
            let next = "";

            blockSearch:
            for (let t = 1; t < _Disk.numTracks; t++) {
                for (let s = 0; s < _Disk.numSectors; s++) {
                    for (let b = 0; b < _Disk.numBlocks; b++) {

                        let potentialKey = this.createStorageKey(t, s, b);
                        let block = sessionStorage.getItem(potentialKey);
                        if (block && this.checkIfInUse(block)) {
                            next = potentialKey;
                            this.setUseStatus(next, true);
                            // we found an empty block, so break from the routine
                            break blockSearch;
                        }
                    }
                }
            }
            return next;
        }

        // Returns key of next available directory block
        public getNextDirBlockKey():string {
            let next = "";

            directorySearch:
            for (let t = 0; t < 1; t++) {
                for (let s = 0; s < _Disk.numSectors; s++) {
                    for (let b = 0; b < _Disk.numBlocks; b++) {

                        let potentialKey = this.createStorageKey(t, s, b);
                        // Skip MBR
                        if (potentialKey == "000") {
                            continue;
                        }

                        let block = sessionStorage.getItem(potentialKey);
                        if (block && this.checkIfInUse(block)) {
                            next = potentialKey;
                            this.setUseStatus(next, true);
                            break directorySearch;
                        }
                    }
                }
            }
            return next;
        }

        public checkIfInUse(data: string): boolean {
            let isUsed = false;
            let dataArr = data.split("");
            if (dataArr[0] === "1") {
                isUsed = true;
            }
            return isUsed;
        }

        public setFinalDataBlock(key) {
            let data = sessionStorage.getItem(key);
            if (data) {
                let temp = data;
                for (let i=1; i<4; i++) {
                    sessionStorage.setItem(key, Utils.replaceAt(temp, i, "-"));
                    temp = sessionStorage.getItem(key);
                }
            }
        }

        public setUseStatus(key, isUsing) {
            let data = sessionStorage.getItem(key);
            if (data) {
                if (isUsing) {
                    sessionStorage.setItem(key, Utils.replaceAt(data, 0, "1"));
                } else {
                    sessionStorage.setItem(key, Utils.replaceAt(data, 0, "0"));
                }
            }
        }
    }
}