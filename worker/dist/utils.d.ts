export declare function getCLIDirectory(): Promise<string>;
export declare enum Language {
    Rust = "rust"
}
export declare function fileExists(path: string): Promise<boolean>;
export declare function getLineOffset(text: string, lineNumber: number): number;
