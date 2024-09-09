class NC {
    private fileText: string;

    constructor(fileText: string) {
        this.fileText = fileText;
    }

    getFileText(): string {
        return this.fileText;
    }

    setFileText(fileText: string): void {
        this.fileText = fileText;
    }
}