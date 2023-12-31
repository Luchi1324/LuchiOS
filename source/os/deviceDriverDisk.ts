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
            return "0".repeat(4) + ":" + "0".repeat(_Disk.blockSize - 4);
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

        public createSwapFile(pid, data): void {
            let fileName: string = '.swap' + pid;

            // file data will be overwritten if file already exists
            this.createFile(fileName);
            this.writeFile(fileName, data);
        }

        public createFile(fileName: string): boolean {
            let createdFlag: boolean = false;
            let startingBlockKey: string = this.findFile(fileName)[1];

            if (!startingBlockKey) {
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
            }
            Devices.hostUpdateDiskDisplay();

            return createdFlag;
        }

        public readFile(fileName: string): string {
            let startingBlockKey: string = this.findFile(fileName)[1];
            let str: string = '';

            if (!startingBlockKey) {
                str = null;
            } else {
                let block: string = sessionStorage.getItem(startingBlockKey);
                let blockArr: string[] = block.split(':');
                let meta: string = blockArr[0];
                let data: string = blockArr[1];

                str += this.readBlockData(data);

                // File contains more than 1 block
                if (meta.slice(1, 4) != '---') {
                    let nextKey: string = meta.slice(1,4);
                    let nextData: string = sessionStorage.getItem(nextKey);

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
            let block: string = '';
            let i: number = 0;
            // loop through array and build block string
            while (i < hexArr.length) {
                block += hexArr[i];
                i++;
            }
            return block;
        }
        
        public writeFile(fileName: string, dataInput: string): number {
            let startingBlockKey: string = this.findFile(fileName)[1];
            let writtenCase: number = 0;

             // check if file exists
             if (!startingBlockKey) {
                writtenCase = 0;
            } else {
                // get the block data
                let data: string = sessionStorage.getItem(startingBlockKey);

                // Remove existing file data before writing to it
                if (this.checkIfHasData(data)) {
                    this.fullDeleteFile(fileName)
                    this.createFile(fileName);
                    startingBlockKey = this.findFile(fileName)[1];
                    data = sessionStorage.getItem(startingBlockKey);
                }

                if (dataInput.length <= 60) {
                    sessionStorage.setItem(startingBlockKey, '1---:' + this.writeDataToBlock(data, dataInput));
                } else {
                    // Each block can only have a max length of 60
                    let dataArr = dataInput.match(/.{1,60}/g);

                    let currKey: string = startingBlockKey;

                    // Loop through each input chunk
                    for (let i = 0; i < dataArr.length; i++) {
                        let nextKey;
                        data = sessionStorage.getItem(currKey);

                        // last input chunk doesn't have a block to link to
                        if (i == dataArr.length-1) {
                            sessionStorage.setItem(currKey, '1---:' + this.writeDataToBlock(data, dataArr[i]));
                        } else {
                            nextKey = this.getNextDataBlockKey();
                            if (nextKey) {
                                sessionStorage.setItem(currKey, '1' + nextKey + ':' + this.writeDataToBlock(data, dataArr[i]));
                            } else {
                                writtenCase = 1;
                                _Disk.isFull = true;
                                break;
                            }
                        }
                        currKey = nextKey;
                    }
                }
                writtenCase = 2;
            }
            return writtenCase;
        }

        public writeDataToBlock(blk, data): string {
            let blkArr = blk.split(':');
            let blkData = blkArr[1].match(/.{1,2}/g);
            let dataArr = data.match(/.{1,2}/g);

            for (let i=0; i<dataArr.length; i++) {
                blkData[i] = dataArr[i];
            }

            return (blkData.join(''));
        }


        public deleteFile(fileName: string): boolean {
            let key: string = this.findFile(fileName)[0];
            let deleteFlag: boolean = false;

            if (key) {
                sessionStorage.setItem(key, this.createEmptyBlock());
                deleteFlag = true;
            }

            Devices.hostUpdateDiskDisplay();
            return deleteFlag;
        }

        public fullDeleteFile(fileName: string) {
            let startingBlockKey: string = this.findFile(fileName)[1];

            if (startingBlockKey) {
                let block: string = sessionStorage.getItem(startingBlockKey);
                let blockArr: string[] = block.split(':');
                let metaData: string = blockArr[0];

                sessionStorage.setItem(startingBlockKey, this.createEmptyBlock());
                let nextKey: string = metaData.slice(1,4);
                let nextData: string = sessionStorage.getItem(nextKey);

                // File contains more than 1 block
                while (nextKey != '---') {
                    sessionStorage.setItem(nextKey, this.createEmptyBlock());
                    nextKey = nextData.split(':')[0].slice(1,4);
                    nextData = sessionStorage.getItem(nextKey);
                }
                // clear the directory once all data has been removed
                this.deleteFile(fileName);
            }
        }


        public copyFile(fileName: string, newFileName: string): number {
            let copyCase: number = 0;
            if (this.findFile(fileName)[0]) {
                let isCreated: boolean = this.createFile(newFileName);
                if (isCreated) {
                    let fileData: string = this.readFile(fileName);
                    let copyFile: number = this.writeFile(newFileName, fileData);
                    if (copyFile === 2) {
                        copyCase = 3;
                    }
                } else {
                    copyCase = 1;
                }
            } else {
                copyCase = 2;
            }
            Devices.hostUpdateDiskDisplay();
            return copyCase;
        }

        public renameFile(fileName: string, newFileName: string): number {
            let renameCase: number = 0;
            let key: string = this.findFile(fileName)[0];
            let otherKey: string = this.findFile(newFileName)[0];

            // make sure existing file actually exists and new file name isn't already in use
            if (key && !otherKey) {
                let data: string = sessionStorage.getItem(key);
                sessionStorage.setItem(key, Utils.replaceAt(data, 5, '0'.repeat(60)));

                data = sessionStorage.getItem(key);
                sessionStorage.setItem(key, Utils.replaceAt(data, 5, Utils.txtToHex(newFileName)));

                renameCase = 2;
            } else if (!key) {
                // The original file does not exist
                renameCase = 0;
            } else if (otherKey) {
                // The new file name is already a file on the disk
                renameCase = 1;
            }

            Devices.hostUpdateDiskDisplay();
            return renameCase;
        }

        public getAllFiles(getHidden: boolean): string[] {
            let fileNames: string[] = []
            for (let t = 0; t < 1; t++) {
                for (let s = 0; s < _Disk.numSectors; s++) {
                    for (let b = 0; b < _Disk.numBlocks; b++) {
                        let file = sessionStorage.getItem(this.createStorageKey(t, s, b));

                        if (file && this.checkIfInUse(file)) {
                            let fileName = Utils.hexToTxt(this.readBlockData(file.split(':')[1]));
                            (getHidden || !fileName.startsWith('.')) ? fileNames.push(fileName) : null;
                        }
                    }
                }
            }
            return fileNames;
        }

        public findFile(fileName): string[] {
            let startingBlockKey = null;
            let fileArr: string[] = [];

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
                                fileArr.push(meta.slice(1, 4));
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
        public getNextDataBlockKey(): string {
            let next = "";

            blockSearch:
            for (let t = 1; t < _Disk.numTracks; t++) {
                for (let s = 0; s < _Disk.numSectors; s++) {
                    for (let b = 0; b < _Disk.numBlocks; b++) {
                        let potentialKey = this.createStorageKey(t, s, b);
                        let block = sessionStorage.getItem(potentialKey);
                        if (block && !(this.checkIfInUse(block))) {
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
        public getNextDirBlockKey(): string {
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
                        if (block && !(this.checkIfInUse(block))) {
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

        public checkIfHasData(block): boolean {
            return block.split(':')[1] != '0'.repeat(60);
        }

        public setFinalDataBlock(key): void {
            let data: string = sessionStorage.getItem(key);
            if (data) {
                let temp = data;
                for (let i = 1; i < 4; i++) {
                    sessionStorage.setItem(key, Utils.replaceAt(temp, i, "-"));
                    temp = sessionStorage.getItem(key);
                }
            }
        }

        public setUseStatus(key, isUsing): void {
            let data: string = sessionStorage.getItem(key);
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
